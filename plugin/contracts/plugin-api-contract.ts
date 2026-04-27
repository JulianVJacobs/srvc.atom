export interface ActorPayload {
  id: string;
  canonicalLabel: string;
  actorKind: string;
  aliases: string[];
}

export interface EventPayload {
  id: string;
  title: string;
  occurredOn: string | null;
  location: string | null;
}

export interface ClaimRecordPayload {
  id: string;
  eventId: string;
  recordType: 'homicide' | 'claim';
  summary: string;
}

export type LinkedRecordType = 'authority_record' | 'archival_description';

export interface ClaimArchivalLinkPayload {
  id: string;
  claimId: string;
  linkedRecordType: LinkedRecordType;
  linkedRecordId: string;
}

export interface VictimPayload {
  id: string;
  eventId: string;
  name: string;
}

export interface PerpetratorPayload {
  id: string;
  eventId: string;
  name: string;
}

export interface ParticipantPayload {
  id: string;
  eventId: string;
  actorId: string;
  role: string;
}

export interface ListQuery {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListResult<TItem> {
  items: TItem[];
  total: number;
}

export interface PluginUserContext {
  userId: string | null;
  roles: string[];
  permissions: string[];
  credential?: Record<string, unknown>;
}

export interface ActorDomainService {
  list(query: ListQuery, context?: PluginUserContext): Promise<ListResult<ActorPayload>>;
  create(
    input: Omit<ActorPayload, 'id'>,
    context?: PluginUserContext,
  ): Promise<ActorPayload>;
}

export interface EventDomainService {
  list(query: ListQuery, context?: PluginUserContext): Promise<ListResult<EventPayload>>;
  create(
    input: Omit<EventPayload, 'id'>,
    context?: PluginUserContext,
  ): Promise<EventPayload>;
}

export interface ClaimDomainService {
  list(query: ListQuery, context?: PluginUserContext): Promise<ListResult<ClaimRecordPayload>>;
  create(
    input: Omit<ClaimRecordPayload, 'id'>,
    context?: PluginUserContext,
  ): Promise<ClaimRecordPayload>;
}

export interface VictimDomainService {
  list(query: ListQuery, context?: PluginUserContext): Promise<ListResult<VictimPayload>>;
  create(
    input: Omit<VictimPayload, 'id'>,
    context?: PluginUserContext,
  ): Promise<VictimPayload>;
}

export interface PerpetratorDomainService {
  list(query: ListQuery, context?: PluginUserContext): Promise<ListResult<PerpetratorPayload>>;
  create(
    input: Omit<PerpetratorPayload, 'id'>,
    context?: PluginUserContext,
  ): Promise<PerpetratorPayload>;
}

export interface ParticipantDomainService {
  list(query: ListQuery, context?: PluginUserContext): Promise<ListResult<ParticipantPayload>>;
  create(
    input: Omit<ParticipantPayload, 'id'>,
    context?: PluginUserContext,
  ): Promise<ParticipantPayload>;
}

export interface ClaimArchivalLinkDomainService {
  listByClaimId(
    claimId: string,
    context?: PluginUserContext,
  ): Promise<ListResult<ClaimArchivalLinkPayload>>;
  create(
    input: Omit<ClaimArchivalLinkPayload, 'id'>,
    context?: PluginUserContext,
  ): Promise<ClaimArchivalLinkPayload>;
}

export interface PluginDomainServices {
  actors: ActorDomainService;
  events: EventDomainService;
  claims: ClaimDomainService;
  claimArchivalLinks: ClaimArchivalLinkDomainService;
  victims: VictimDomainService;
  perpetrators: PerpetratorDomainService;
  participants: ParticipantDomainService;
}
