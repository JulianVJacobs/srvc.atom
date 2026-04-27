const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { createClient } = require('@libsql/client');

const REHEARSAL_OUTPUT_PATH = path.resolve(
  '.github/fleet/3.0.0/migration-rehearsal-result.json',
);

const toFileUrl = (filePath) => `file:${filePath}`;

async function loadMigrationSql() {
  const schemaPath = path.resolve('lib/db/schema.ts');
  const schemaText = await fs.readFile(schemaPath, 'utf8');

  const interpolationValues = {
    confidenceCheckConstraint:
      'CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100))',
    eventActorRoleCertaintyCheckConstraint:
      "CHECK (certainty IN ('known', 'suspected', 'unknown'))",
    claimSubjectTypeConstraint:
      "CHECK (subject_type IN ('actor', 'event_actor_role'))",
    claimValueTypeConstraint:
      "CHECK (value_type IN ('string', 'boolean', 'date', 'integer'))",
    claimEvidenceStrengthConstraint:
      "CHECK (evidence_strength IN ('strong', 'moderate', 'weak'))",
  };

  const resolveInterpolations = (sqlTemplate) =>
    sqlTemplate.replace(/\$\{([^}]+)\}/g, (_fullMatch, token) => {
      const trimmedToken = String(token).trim();
      const resolved = interpolationValues[trimmedToken];
      if (!resolved) {
        throw new Error(`Unsupported SQL interpolation token: ${trimmedToken}`);
      }
      return resolved;
    });

  const sqlByConst = new Map();
  const sqlConstRegex = /export const (\w+)\s*=\s*`([\s\S]*?)`;/g;
  for (const match of schemaText.matchAll(sqlConstRegex)) {
    sqlByConst.set(match[1], resolveInterpolations(match[2]).trim());
  }

  const migrationIndexesBlock = schemaText.match(
    /export const migrationIndexes = \[([\s\S]*?)\];/,
  );
  const migrationIndexes = [];
  if (migrationIndexesBlock) {
    for (const match of migrationIndexesBlock[1].matchAll(/`([\s\S]*?)`/g)) {
      migrationIndexes.push(match[1].trim());
    }
  }

  const migrationListMatch = schemaText.match(/export const migrations = \[([\s\S]*?)\];/);
  if (!migrationListMatch) {
    throw new Error('Unable to find migrations array in lib/db/schema.ts');
  }

  const tokens = migrationListMatch[1]
    .split(',')
    .map((token) => token.replace(/\/\/.*$/gm, '').trim())
    .filter(Boolean);

  const migrationSql = [];
  for (const token of tokens) {
    if (token === '...migrationIndexes') {
      migrationSql.push(...migrationIndexes);
      continue;
    }

    const sql = sqlByConst.get(token);
    if (!sql) {
      throw new Error(`Unable to resolve SQL for migration token: ${token}`);
    }
    migrationSql.push(sql);
  }

  return migrationSql;
}

async function withClient(dbPath, fn) {
  const client = createClient({ url: toFileUrl(dbPath) });
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

async function createLegacyDataset(dbPath) {
  await withClient(dbPath, async (client) => {
    await client.execute(`CREATE TABLE IF NOT EXISTS victims (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      victim_name TEXT,
      date_of_death TEXT,
      place_of_death_province TEXT,
      place_of_death_town TEXT,
      type_of_location TEXT,
      police_station TEXT,
      sexual_assault TEXT,
      gender_of_victim TEXT,
      race_of_victim TEXT,
      age_of_victim INTEGER,
      age_range_of_victim TEXT,
      mode_of_death_specific TEXT,
      mode_of_death_general TEXT,
      type_of_murder TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      failure_count INTEGER DEFAULT 0,
      last_sync_at TEXT
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS perpetrators (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      perpetrator_name TEXT,
      perpetrator_relationship_to_victim TEXT,
      suspect_identified TEXT,
      suspect_arrested TEXT,
      suspect_charged TEXT,
      conviction TEXT,
      sentence TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      failure_count INTEGER DEFAULT 0,
      last_sync_at TEXT
    )`);

    await client.execute({
      sql: `INSERT INTO victims (
        id, article_id, victim_name, date_of_death, place_of_death_province,
        place_of_death_town, type_of_location, police_station, sexual_assault,
        gender_of_victim, race_of_victim, age_of_victim, age_range_of_victim,
        mode_of_death_specific, mode_of_death_general, type_of_murder
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'victim-legacy-1',
        'article-1',
        'Jane Doe',
        '2026-01-03',
        'Gauteng',
        'Johannesburg',
        'street',
        'Central',
        'no',
        'female',
        'unknown',
        31,
        '30-39',
        'gunshot',
        'firearm',
        'single',
      ],
    });

    await client.execute({
      sql: `INSERT INTO perpetrators (
        id, article_id, perpetrator_name, perpetrator_relationship_to_victim,
        suspect_identified, suspect_arrested, suspect_charged, conviction, sentence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'perp-legacy-1',
        'article-1',
        'John Roe',
        'partner',
        'yes',
        'yes',
        'yes',
        'pending',
        null,
      ],
    });
  });
}

async function getBaselineSnapshot(dbPath) {
  return withClient(dbPath, async (client) => {
    const victimsCount = Number(
      (await client.execute('SELECT COUNT(*) AS count FROM victims')).rows?.[0]
        ?.count ?? 0,
    );
    const perpetratorsCount = Number(
      (await client.execute('SELECT COUNT(*) AS count FROM perpetrators')).rows?.[0]
        ?.count ?? 0,
    );

    const victims = ((await client.execute('SELECT id, victim_name FROM victims ORDER BY id')).rows ?? []).map((row) => ({
      id: String(row.id),
      victim_name: row.victim_name == null ? null : String(row.victim_name),
    }));

    const perpetrators = ((await client.execute('SELECT id, perpetrator_name FROM perpetrators ORDER BY id')).rows ?? []).map((row) => ({
      id: String(row.id),
      perpetrator_name:
        row.perpetrator_name == null ? null : String(row.perpetrator_name),
    }));

    return { victimsCount, perpetratorsCount, victims, perpetrators };
  });
}

async function applyAllMigrations(dbPath, migrations) {
  await withClient(dbPath, async (client) => {
    for (const sql of migrations) {
      try {
        await client.execute(sql);
      } catch (error) {
        const message = (error instanceof Error ? error.message : String(error)).toLowerCase();

        if (
          sql.startsWith('ALTER TABLE') &&
          message.includes('near "exists": syntax error') &&
          sql.includes('ADD COLUMN IF NOT EXISTS')
        ) {
          const fallbackSql = sql.replace('ADD COLUMN IF NOT EXISTS', 'ADD COLUMN');
          try {
            await client.execute(fallbackSql);
            continue;
          } catch (fallbackError) {
            const fallbackMessage = (
              fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
            ).toLowerCase();
            if (
              fallbackMessage.includes('duplicate column name') ||
              fallbackMessage.includes('already exists')
            ) {
              continue;
            }
            throw fallbackError;
          }
        }

        if (
          sql.startsWith('ALTER TABLE') &&
          (message.includes('duplicate column name') || message.includes('already exists'))
        ) {
          continue;
        }
        throw error;
      }
    }
  });
}

async function buildSummary(baseline, dbPath, migrationCount) {
  return withClient(dbPath, async (client) => {
    const victimsCount = Number((await client.execute('SELECT COUNT(*) AS count FROM victims')).rows?.[0]?.count ?? 0);
    const perpetratorsCount = Number((await client.execute('SELECT COUNT(*) AS count FROM perpetrators')).rows?.[0]?.count ?? 0);
    const actorCount = Number((await client.execute('SELECT COUNT(*) AS count FROM actor')).rows?.[0]?.count ?? 0);
    const legacyIdentifierCount = Number(
      (
        await client.execute(
          "SELECT COUNT(*) AS count FROM actor_identifier WHERE namespace IN ('legacy_victim_id', 'legacy_perp_id')",
        )
      ).rows?.[0]?.count ?? 0,
    );

    const victims = ((await client.execute('SELECT id, victim_name FROM victims ORDER BY id')).rows ?? []).map((row) => ({
      id: String(row.id),
      victim_name: row.victim_name == null ? null : String(row.victim_name),
    }));

    const perpetrators = ((await client.execute('SELECT id, perpetrator_name FROM perpetrators ORDER BY id')).rows ?? []).map((row) => ({
      id: String(row.id),
      perpetrator_name:
        row.perpetrator_name == null ? null : String(row.perpetrator_name),
    }));

    const sourceRowsPreserved =
      JSON.stringify(victims) === JSON.stringify(baseline.victims) &&
      JSON.stringify(perpetrators) === JSON.stringify(baseline.perpetrators);

    return {
      timestamp: new Date().toISOString(),
      rehearsalDbPath: dbPath,
      migrationStatements: migrationCount,
      baseline,
      postMigration: {
        victimsCount,
        perpetratorsCount,
        actorCount,
        legacyIdentifierCount,
        victims,
        perpetrators,
      },
      verification: {
        noVictimLoss: victimsCount === baseline.victimsCount,
        noPerpetratorLoss: perpetratorsCount === baseline.perpetratorsCount,
        sourceRowsPreserved,
        actorBackfillPresent: actorCount >= baseline.victimsCount + baseline.perpetratorsCount,
        legacyIdentifiersPresent:
          legacyIdentifierCount >= baseline.victimsCount + baseline.perpetratorsCount,
      },
    };
  });
}

async function main() {
  const migrationSql = await loadMigrationSql();

  const rehearsalDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hmt-migration-rehearsal-'));
  const sourceDbPath = path.join(rehearsalDir, 'production-representative-source.db');
  const rehearsalDbPath = path.join(rehearsalDir, 'migration-rehearsal-copy.db');

  await createLegacyDataset(sourceDbPath);
  const baseline = await getBaselineSnapshot(sourceDbPath);

  await fs.copyFile(sourceDbPath, rehearsalDbPath);
  await applyAllMigrations(rehearsalDbPath, migrationSql);

  const summary = await buildSummary(
    baseline,
    rehearsalDbPath,
    migrationSql.length,
  );

  await fs.mkdir(path.dirname(REHEARSAL_OUTPUT_PATH), { recursive: true });
  await fs.writeFile(REHEARSAL_OUTPUT_PATH, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  const allChecksPassed = Object.values(summary.verification).every(Boolean);
  if (!allChecksPassed) {
    throw new Error(`Migration rehearsal checks failed: ${JSON.stringify(summary.verification)}`);
  }

  console.log(`Migration rehearsal completed. Summary written to ${REHEARSAL_OUTPUT_PATH}`);
  console.log(JSON.stringify(summary.verification));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
