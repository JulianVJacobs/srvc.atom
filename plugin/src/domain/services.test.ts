import { PluginDomainPortService, type PluginDatabaseSession } from './services';

type Statement = string | { sql: string; args?: unknown[] };

class InMemoryPluginSession implements PluginDatabaseSession {
  private tables = new Map<string, Map<string, Record<string, unknown>>>();

  async execute(statement: Statement): Promise<{ rows?: unknown[]; rowsAffected?: number }> {
    const sql = typeof statement === 'string' ? statement : statement.sql;
    const args = typeof statement === 'string' ? [] : statement.args ?? [];

    if (sql.startsWith('INSERT OR REPLACE INTO')) {
      return this.insertOrReplace(sql, args);
    }

    if (sql.startsWith('SELECT')) {
      return this.selectById(sql, args);
    }

    return { rows: [], rowsAffected: 0 };
  }

  private insertOrReplace(sql: string, args: unknown[]) {
    const match = sql.match(/INSERT OR REPLACE INTO\s+([a-z_]+)/i);
    const table = match?.[1];
    if (!table) {
      return { rowsAffected: 0 };
    }

    const columnsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
    const columns = columnsMatch
      ? columnsMatch[1].split(',').map((entry) => entry.trim())
      : [];

    const row: Record<string, unknown> = {};
    columns.forEach((column, index) => {
      row[column] = args[index] ?? null;
    });

    const id = String(row.id ?? '');
    if (!id) {
      return { rowsAffected: 0 };
    }

    const tableRows = this.tables.get(table) ?? new Map<string, Record<string, unknown>>();
    tableRows.set(id, row);
    this.tables.set(table, tableRows);

    return { rowsAffected: 1 };
  }

  private selectById(sql: string, args: unknown[]) {
    const match = sql.match(/FROM\s+([a-z_]+)\s+WHERE\s+id\s*=\s*\?/i);
    const table = match?.[1];
    const id = String(args[0] ?? '');
    if (!table || !id) {
      return { rows: [] };
    }

    const row = this.tables.get(table)?.get(id);
    return { rows: row ? [row] : [] };
  }
}

describe('PluginDomainPortService', () => {
  it('writes and reads actor, event, claim, victim, perpetrator, and participant profile records', async () => {
    const service = new PluginDomainPortService(new InMemoryPluginSession());

    await service.saveActor({
      id: 'actor-1',
      canonicalLabel: 'Jane Doe',
      actorKind: 'person',
      status: 'active',
      schemaProfileId: 'homicide-profile',
    });

    await service.saveEvent({
      id: 'event-1',
      eventTypes: ['homicide'],
      articleIds: ['article-1'],
      participantIds: ['participant-1'],
      details: { note: 'mapped details' },
    });

    await service.saveClaim({
      id: 'claim-1',
      subjectType: 'actor',
      subjectId: 'actor-1',
      predicateKey: 'role',
      valueJson: { label: 'victim' },
      valueType: 'string',
      confidence: 85,
      assertedBy: 'tester',
    });

    await service.saveVictim({
      id: 'victim-1',
      articleId: 'article-1',
      victimName: 'Jane Doe',
      victimAlias: 'J.D.',
      dateOfDeath: '2026-04-21',
      placeOfDeathProvince: 'Gauteng',
      placeOfDeathTown: 'Johannesburg',
      typeOfLocation: 'street',
      policeStation: 'Central',
      sexualAssault: 'no',
      genderOfVictim: 'female',
      raceOfVictim: 'unknown',
      ageOfVictim: 31,
      ageRangeOfVictim: '30-39',
      modeOfDeathSpecific: 'gunshot',
      modeOfDeathGeneral: 'firearm',
      typeOfMurder: 'single',
    });

    await service.savePerpetrator({
      id: 'perp-1',
      articleId: 'article-1',
      perpetratorName: 'John Roe',
      perpetratorAlias: 'J.R.',
      perpetratorRelationshipToVictim: 'partner',
      suspectIdentified: 'yes',
      suspectArrested: 'yes',
      suspectCharged: 'yes',
      conviction: 'pending',
      sentence: null,
    });

    await service.saveParticipantProfile({
      id: 'profile-1',
      name: 'Homicide profile',
      entityLevel: 'participant',
      description: 'Lane 03 profile mapping',
      createdBy: 'tester',
      updatedBy: 'tester',
    });

    await expect(service.getActor('actor-1')).resolves.toEqual({
      id: 'actor-1',
      canonicalLabel: 'Jane Doe',
      actorKind: 'person',
      status: 'active',
      schemaProfileId: 'homicide-profile',
    });

    await expect(service.getEvent('event-1')).resolves.toEqual({
      id: 'event-1',
      eventTypes: ['homicide'],
      articleIds: ['article-1'],
      participantIds: ['participant-1'],
      details: { note: 'mapped details' },
    });

    await expect(service.getClaim('claim-1')).resolves.toEqual({
      id: 'claim-1',
      subjectType: 'actor',
      subjectId: 'actor-1',
      predicateKey: 'role',
      valueJson: { label: 'victim' },
      valueType: 'string',
      confidence: 85,
      assertedBy: 'tester',
    });

    await expect(service.getVictim('victim-1')).resolves.toEqual({
      id: 'victim-1',
      articleId: 'article-1',
      victimName: 'Jane Doe',
      victimAlias: 'J.D.',
      dateOfDeath: '2026-04-21',
      placeOfDeathProvince: 'Gauteng',
      placeOfDeathTown: 'Johannesburg',
      typeOfLocation: 'street',
      policeStation: 'Central',
      sexualAssault: 'no',
      genderOfVictim: 'female',
      raceOfVictim: 'unknown',
      ageOfVictim: 31,
      ageRangeOfVictim: '30-39',
      modeOfDeathSpecific: 'gunshot',
      modeOfDeathGeneral: 'firearm',
      typeOfMurder: 'single',
    });

    await expect(service.getPerpetrator('perp-1')).resolves.toEqual({
      id: 'perp-1',
      articleId: 'article-1',
      perpetratorName: 'John Roe',
      perpetratorAlias: 'J.R.',
      perpetratorRelationshipToVictim: 'partner',
      suspectIdentified: 'yes',
      suspectArrested: 'yes',
      suspectCharged: 'yes',
      conviction: 'pending',
      sentence: null,
    });

    await expect(service.getParticipantProfile('profile-1')).resolves.toEqual({
      id: 'profile-1',
      name: 'Homicide profile',
      entityLevel: 'participant',
      description: 'Lane 03 profile mapping',
      createdBy: 'tester',
      updatedBy: 'tester',
    });
  });
});
