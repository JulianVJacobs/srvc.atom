import {
  mapActorFromPersistence,
  mapActorToPersistence,
  mapClaimFromPersistence,
  mapClaimToPersistence,
  mapEventFromPersistence,
  mapEventToPersistence,
  mapParticipantProfileFromPersistence,
  mapParticipantProfileToPersistence,
  mapPerpetratorFromPersistence,
  mapPerpetratorToPersistence,
  mapVictimFromPersistence,
  mapVictimToPersistence,
  type ActorPersistence,
  type ClaimPersistence,
  type EventPersistence,
  type ParticipantProfilePersistence,
  type PerpetratorPersistence,
  type VictimPersistence,
  type WorkbenchActor,
  type WorkbenchClaim,
  type WorkbenchEventRecord,
  type WorkbenchParticipantProfile,
  type WorkbenchPerpetrator,
  type WorkbenchVictim,
} from './mappers';

export type SqlStatement = string | { sql: string; args?: unknown[] };

export type PluginDatabaseSession = {
  execute: (
    statement: SqlStatement,
  ) => Promise<{ rows?: unknown[]; rowsAffected?: number } | unknown>;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const toPersistenceRow = <T>(value: unknown): T | null => {
  const row = asRecord(value);
  return row ? (row as unknown as T) : null;
};

export class PluginDomainPortService {
  constructor(private readonly session: PluginDatabaseSession) {}

  async saveActor(actor: WorkbenchActor): Promise<void> {
    const row = mapActorToPersistence(actor);
    await this.session.execute({
      sql: `INSERT OR REPLACE INTO atom_actor (id, canonical_label, actor_kind, status, schema_profile_id)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        row.id,
        row.canonical_label,
        row.actor_kind,
        row.status,
        row.schema_profile_id,
      ],
    });
  }

  async getActor(id: string): Promise<WorkbenchActor | null> {
    const row = await this.selectOne<ActorPersistence>(
      'SELECT id, canonical_label, actor_kind, status, schema_profile_id FROM atom_actor WHERE id = ?',
      [id],
    );
    return row ? mapActorFromPersistence(row) : null;
  }

  async saveEvent(event: WorkbenchEventRecord): Promise<void> {
    const row = mapEventToPersistence(event);
    await this.session.execute({
      sql: `INSERT OR REPLACE INTO atom_event (id, event_types, article_ids, participant_ids, details)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        row.id,
        row.event_types,
        row.article_ids,
        row.participant_ids,
        row.details,
      ],
    });
  }

  async getEvent(id: string): Promise<WorkbenchEventRecord | null> {
    const row = await this.selectOne<EventPersistence>(
      'SELECT id, event_types, article_ids, participant_ids, details FROM atom_event WHERE id = ?',
      [id],
    );
    return row ? mapEventFromPersistence(row) : null;
  }

  async saveClaim(claim: WorkbenchClaim): Promise<void> {
    const row = mapClaimToPersistence(claim);
    await this.session.execute({
      sql: `INSERT OR REPLACE INTO atom_claim (id, subject_type, subject_id, predicate_key, value_json, value_type, confidence, asserted_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        row.id,
        row.subject_type,
        row.subject_id,
        row.predicate_key,
        row.value_json,
        row.value_type,
        row.confidence,
        row.asserted_by,
      ],
    });
  }

  async getClaim(id: string): Promise<WorkbenchClaim | null> {
    const row = await this.selectOne<ClaimPersistence>(
      'SELECT id, subject_type, subject_id, predicate_key, value_json, value_type, confidence, asserted_by FROM atom_claim WHERE id = ?',
      [id],
    );
    return row ? mapClaimFromPersistence(row) : null;
  }

  async saveVictim(victim: WorkbenchVictim): Promise<void> {
    const row = mapVictimToPersistence(victim);
    await this.session.execute({
      sql: `INSERT OR REPLACE INTO atom_victim (
            id, article_id, victim_name, victim_alias, date_of_death,
            place_of_death_province, place_of_death_town, type_of_location, police_station,
            sexual_assault, gender_of_victim, race_of_victim, age_of_victim,
            age_range_of_victim, mode_of_death_specific, mode_of_death_general, type_of_murder
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        row.id,
        row.article_id,
        row.victim_name,
        row.victim_alias,
        row.date_of_death,
        row.place_of_death_province,
        row.place_of_death_town,
        row.type_of_location,
        row.police_station,
        row.sexual_assault,
        row.gender_of_victim,
        row.race_of_victim,
        row.age_of_victim,
        row.age_range_of_victim,
        row.mode_of_death_specific,
        row.mode_of_death_general,
        row.type_of_murder,
      ],
    });
  }

  async getVictim(id: string): Promise<WorkbenchVictim | null> {
    const row = await this.selectOne<VictimPersistence>(
      `SELECT id, article_id, victim_name, victim_alias, date_of_death,
              place_of_death_province, place_of_death_town, type_of_location, police_station,
              sexual_assault, gender_of_victim, race_of_victim, age_of_victim,
              age_range_of_victim, mode_of_death_specific, mode_of_death_general, type_of_murder
       FROM atom_victim WHERE id = ?`,
      [id],
    );
    return row ? mapVictimFromPersistence(row) : null;
  }

  async savePerpetrator(perpetrator: WorkbenchPerpetrator): Promise<void> {
    const row = mapPerpetratorToPersistence(perpetrator);
    await this.session.execute({
      sql: `INSERT OR REPLACE INTO atom_perpetrator (
            id, article_id, perpetrator_name, perpetrator_alias,
            perpetrator_relationship_to_victim, suspect_identified, suspect_arrested,
            suspect_charged, conviction, sentence
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        row.id,
        row.article_id,
        row.perpetrator_name,
        row.perpetrator_alias,
        row.perpetrator_relationship_to_victim,
        row.suspect_identified,
        row.suspect_arrested,
        row.suspect_charged,
        row.conviction,
        row.sentence,
      ],
    });
  }

  async getPerpetrator(id: string): Promise<WorkbenchPerpetrator | null> {
    const row = await this.selectOne<PerpetratorPersistence>(
      `SELECT id, article_id, perpetrator_name, perpetrator_alias,
              perpetrator_relationship_to_victim, suspect_identified, suspect_arrested,
              suspect_charged, conviction, sentence
       FROM atom_perpetrator WHERE id = ?`,
      [id],
    );
    return row ? mapPerpetratorFromPersistence(row) : null;
  }

  async saveParticipantProfile(profile: WorkbenchParticipantProfile): Promise<void> {
    const row = mapParticipantProfileToPersistence(profile);
    await this.session.execute({
      sql: `INSERT OR REPLACE INTO atom_participant_profile (
            id, name, entity_level, description, created_by, updated_by
          ) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        row.id,
        row.name,
        row.entity_level,
        row.description,
        row.created_by,
        row.updated_by,
      ],
    });
  }

  async getParticipantProfile(
    id: string,
  ): Promise<WorkbenchParticipantProfile | null> {
    const row = await this.selectOne<ParticipantProfilePersistence>(
      'SELECT id, name, entity_level, description, created_by, updated_by FROM atom_participant_profile WHERE id = ?',
      [id],
    );
    return row ? mapParticipantProfileFromPersistence(row) : null;
  }

  private async selectOne<T>(sql: string, args: unknown[]): Promise<T | null> {
    const result = await this.session.execute({ sql, args });
    const rows =
      result &&
      typeof result === 'object' &&
      'rows' in result &&
      Array.isArray((result as { rows?: unknown[] }).rows)
        ? (result as { rows: unknown[] }).rows
        : [];
    return toPersistenceRow<T>(rows[0] ?? null);
  }
}
