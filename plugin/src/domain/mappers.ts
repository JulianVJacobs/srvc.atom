export type WorkbenchActor = {
  id: string;
  canonicalLabel: string | null;
  actorKind: string;
  status: string;
  schemaProfileId: string | null;
};

export type ActorPersistence = {
  id: string;
  canonical_label: string | null;
  actor_kind: string;
  status: string;
  schema_profile_id: string | null;
};

export type WorkbenchEventRecord = {
  id: string;
  eventTypes: string[];
  articleIds: string[];
  participantIds: string[] | null;
  details: unknown;
};

export type EventPersistence = {
  id: string;
  event_types: string;
  article_ids: string;
  participant_ids: string | null;
  details: string | null;
};

export type WorkbenchClaim = {
  id: string;
  subjectType: string;
  subjectId: string;
  predicateKey: string;
  valueJson: unknown;
  valueType: string;
  confidence: number | null;
  assertedBy: string | null;
};

export type ClaimPersistence = {
  id: string;
  subject_type: string;
  subject_id: string;
  predicate_key: string;
  value_json: string | null;
  value_type: string;
  confidence: number | null;
  asserted_by: string | null;
};

export type WorkbenchVictim = {
  id: string;
  articleId: string;
  victimName: string | null;
  victimAlias: string | null;
  dateOfDeath: string | null;
  placeOfDeathProvince: string | null;
  placeOfDeathTown: string | null;
  typeOfLocation: string | null;
  policeStation: string | null;
  sexualAssault: string | null;
  genderOfVictim: string | null;
  raceOfVictim: string | null;
  ageOfVictim: number | null;
  ageRangeOfVictim: string | null;
  modeOfDeathSpecific: string | null;
  modeOfDeathGeneral: string | null;
  typeOfMurder: string | null;
};

export type VictimPersistence = {
  id: string;
  article_id: string;
  victim_name: string | null;
  victim_alias: string | null;
  date_of_death: string | null;
  place_of_death_province: string | null;
  place_of_death_town: string | null;
  type_of_location: string | null;
  police_station: string | null;
  sexual_assault: string | null;
  gender_of_victim: string | null;
  race_of_victim: string | null;
  age_of_victim: number | null;
  age_range_of_victim: string | null;
  mode_of_death_specific: string | null;
  mode_of_death_general: string | null;
  type_of_murder: string | null;
};

export type WorkbenchPerpetrator = {
  id: string;
  articleId: string;
  perpetratorName: string | null;
  perpetratorAlias: string | null;
  perpetratorRelationshipToVictim: string | null;
  suspectIdentified: string | null;
  suspectArrested: string | null;
  suspectCharged: string | null;
  conviction: string | null;
  sentence: string | null;
};

export type PerpetratorPersistence = {
  id: string;
  article_id: string;
  perpetrator_name: string | null;
  perpetrator_alias: string | null;
  perpetrator_relationship_to_victim: string | null;
  suspect_identified: string | null;
  suspect_arrested: string | null;
  suspect_charged: string | null;
  conviction: string | null;
  sentence: string | null;
};

export type WorkbenchParticipantProfile = {
  id: string;
  name: string;
  entityLevel: string;
  description: string | null;
  createdBy: string | null;
  updatedBy: string | null;
};

export type ParticipantProfilePersistence = {
  id: string;
  name: string;
  entity_level: string;
  description: string | null;
  created_by: string | null;
  updated_by: string | null;
};

const toJson = (value: unknown): string => JSON.stringify(value);

const fromJson = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const mapActorToPersistence = (actor: WorkbenchActor): ActorPersistence => ({
  id: actor.id,
  canonical_label: actor.canonicalLabel,
  actor_kind: actor.actorKind,
  status: actor.status,
  schema_profile_id: actor.schemaProfileId,
});

export const mapActorFromPersistence = (
  actor: ActorPersistence,
): WorkbenchActor => ({
  id: actor.id,
  canonicalLabel: actor.canonical_label,
  actorKind: actor.actor_kind,
  status: actor.status,
  schemaProfileId: actor.schema_profile_id,
});

export const mapEventToPersistence = (
  event: WorkbenchEventRecord,
): EventPersistence => ({
  id: event.id,
  event_types: toJson(event.eventTypes),
  article_ids: toJson(event.articleIds),
  participant_ids: event.participantIds ? toJson(event.participantIds) : null,
  details: event.details == null ? null : toJson(event.details),
});

export const mapEventFromPersistence = (
  event: EventPersistence,
): WorkbenchEventRecord => ({
  id: event.id,
  eventTypes: fromJson<string[]>(event.event_types, []),
  articleIds: fromJson<string[]>(event.article_ids, []),
  participantIds: fromJson<string[] | null>(event.participant_ids, null),
  details: fromJson<unknown>(event.details, null),
});

export const mapClaimToPersistence = (
  claim: WorkbenchClaim,
): ClaimPersistence => ({
  id: claim.id,
  subject_type: claim.subjectType,
  subject_id: claim.subjectId,
  predicate_key: claim.predicateKey,
  value_json: claim.valueJson == null ? null : toJson(claim.valueJson),
  value_type: claim.valueType,
  confidence: claim.confidence,
  asserted_by: claim.assertedBy,
});

export const mapClaimFromPersistence = (
  claim: ClaimPersistence,
): WorkbenchClaim => ({
  id: claim.id,
  subjectType: claim.subject_type,
  subjectId: claim.subject_id,
  predicateKey: claim.predicate_key,
  valueJson: fromJson<unknown>(claim.value_json, null),
  valueType: claim.value_type,
  confidence: claim.confidence,
  assertedBy: claim.asserted_by,
});

export const mapVictimToPersistence = (
  victim: WorkbenchVictim,
): VictimPersistence => ({
  id: victim.id,
  article_id: victim.articleId,
  victim_name: victim.victimName,
  victim_alias: victim.victimAlias,
  date_of_death: victim.dateOfDeath,
  place_of_death_province: victim.placeOfDeathProvince,
  place_of_death_town: victim.placeOfDeathTown,
  type_of_location: victim.typeOfLocation,
  police_station: victim.policeStation,
  sexual_assault: victim.sexualAssault,
  gender_of_victim: victim.genderOfVictim,
  race_of_victim: victim.raceOfVictim,
  age_of_victim: victim.ageOfVictim,
  age_range_of_victim: victim.ageRangeOfVictim,
  mode_of_death_specific: victim.modeOfDeathSpecific,
  mode_of_death_general: victim.modeOfDeathGeneral,
  type_of_murder: victim.typeOfMurder,
});

export const mapVictimFromPersistence = (
  victim: VictimPersistence,
): WorkbenchVictim => ({
  id: victim.id,
  articleId: victim.article_id,
  victimName: victim.victim_name,
  victimAlias: victim.victim_alias,
  dateOfDeath: victim.date_of_death,
  placeOfDeathProvince: victim.place_of_death_province,
  placeOfDeathTown: victim.place_of_death_town,
  typeOfLocation: victim.type_of_location,
  policeStation: victim.police_station,
  sexualAssault: victim.sexual_assault,
  genderOfVictim: victim.gender_of_victim,
  raceOfVictim: victim.race_of_victim,
  ageOfVictim: victim.age_of_victim,
  ageRangeOfVictim: victim.age_range_of_victim,
  modeOfDeathSpecific: victim.mode_of_death_specific,
  modeOfDeathGeneral: victim.mode_of_death_general,
  typeOfMurder: victim.type_of_murder,
});

export const mapPerpetratorToPersistence = (
  perpetrator: WorkbenchPerpetrator,
): PerpetratorPersistence => ({
  id: perpetrator.id,
  article_id: perpetrator.articleId,
  perpetrator_name: perpetrator.perpetratorName,
  perpetrator_alias: perpetrator.perpetratorAlias,
  perpetrator_relationship_to_victim:
    perpetrator.perpetratorRelationshipToVictim,
  suspect_identified: perpetrator.suspectIdentified,
  suspect_arrested: perpetrator.suspectArrested,
  suspect_charged: perpetrator.suspectCharged,
  conviction: perpetrator.conviction,
  sentence: perpetrator.sentence,
});

export const mapPerpetratorFromPersistence = (
  perpetrator: PerpetratorPersistence,
): WorkbenchPerpetrator => ({
  id: perpetrator.id,
  articleId: perpetrator.article_id,
  perpetratorName: perpetrator.perpetrator_name,
  perpetratorAlias: perpetrator.perpetrator_alias,
  perpetratorRelationshipToVictim:
    perpetrator.perpetrator_relationship_to_victim,
  suspectIdentified: perpetrator.suspect_identified,
  suspectArrested: perpetrator.suspect_arrested,
  suspectCharged: perpetrator.suspect_charged,
  conviction: perpetrator.conviction,
  sentence: perpetrator.sentence,
});

export const mapParticipantProfileToPersistence = (
  profile: WorkbenchParticipantProfile,
): ParticipantProfilePersistence => ({
  id: profile.id,
  name: profile.name,
  entity_level: profile.entityLevel,
  description: profile.description,
  created_by: profile.createdBy,
  updated_by: profile.updatedBy,
});

export const mapParticipantProfileFromPersistence = (
  profile: ParticipantProfilePersistence,
): WorkbenchParticipantProfile => ({
  id: profile.id,
  name: profile.name,
  entityLevel: profile.entity_level,
  description: profile.description,
  createdBy: profile.created_by,
  updatedBy: profile.updated_by,
});
