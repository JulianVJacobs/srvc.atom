import { bootstrapPlugin } from '../bootstrap';
import type {
  ActorPayload,
  ClaimArchivalLinkPayload,
  ClaimRecordPayload,
  EventPayload,
  ListQuery,
  PerpetratorPayload,
  ParticipantPayload,
  PluginDomainServices,
  PluginUserContext,
  VictimPayload,
} from '../contracts/plugin-api-contract';
import type { PluginAuthContext } from '../contracts/http';
import type { PluginScaffold } from '../scaffold/plugin-scaffold';

type RouteResource =
  | 'actors'
  | 'events'
  | 'claims'
  | 'victims'
  | 'perpetrators'
  | 'participants';

type RuntimeState = {
  actors: ActorPayload[];
  events: EventPayload[];
  claims: ClaimRecordPayload[];
  victims: VictimPayload[];
  perpetrators: PerpetratorPayload[];
  participants: ParticipantPayload[];
  claimArchivalLinks: ClaimArchivalLinkPayload[];
};

const initialRuntimeState = (): RuntimeState => ({
  actors: [],
  events: [],
  claims: [],
  victims: [],
  perpetrators: [],
  participants: [],
  claimArchivalLinks: [],
});

const toSearchText = (value: Record<string, unknown>): string =>
  Object.values(value)
    .filter((candidate) => typeof candidate === 'string')
    .join(' ')
    .toLowerCase();

const listState = <T extends Record<string, unknown>>(
  source: T[],
  query: ListQuery,
): { items: T[]; total: number } => {
  const search = query.search?.trim().toLowerCase();
  const filtered = search
    ? source.filter((entry) => toSearchText(entry).includes(search))
    : source;
  const offset = query.offset ?? 0;
  const limit = query.limit ?? 25;
  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
};

const createEntityService = <
  TResource extends RouteResource,
  TEntity extends { id: string },
>(
  state: RuntimeState,
  resource: TResource,
  idPrefix: string,
) => {
  let nextId = 1;

  return {
    list: async (
      query: ListQuery,
      _context?: PluginUserContext,
    ): Promise<{ items: TEntity[]; total: number }> =>
      listState(state[resource] as TEntity[], query),
    create: async (
      input: Omit<TEntity, 'id'>,
      _context?: PluginUserContext,
    ): Promise<TEntity> => {
      const created = {
        id: `${idPrefix}-${nextId++}`,
        ...input,
      } as TEntity;
      (state[resource] as TEntity[]).push(created);
      return created;
    },
  };
};

const createHostedDomainServices = (): PluginDomainServices => {
  const state = initialRuntimeState();
  let nextLinkId = 1;

  return {
    actors: createEntityService<'actors', ActorPayload>(state, 'actors', 'actor'),
    events: createEntityService<'events', EventPayload>(state, 'events', 'event'),
    claims: createEntityService<'claims', ClaimRecordPayload>(state, 'claims', 'claim'),
    victims: createEntityService<'victims', VictimPayload>(state, 'victims', 'victim'),
    perpetrators: createEntityService<'perpetrators', PerpetratorPayload>(
      state,
      'perpetrators',
      'perpetrator',
    ),
    participants: createEntityService<'participants', ParticipantPayload>(
      state,
      'participants',
      'participant',
    ),
    claimArchivalLinks: {
      listByClaimId: async (claimId) => {
        const items = state.claimArchivalLinks.filter(
          (entry) => entry.claimId === claimId,
        );
        return { items, total: items.length };
      },
      create: async (input) => {
        const created: ClaimArchivalLinkPayload = {
          id: `claim-link-${nextLinkId++}`,
          ...input,
        };
        state.claimArchivalLinks.push(created);
        return created;
      },
    },
  };
};

const splitCommaSeparatedHeader = (value: string | null): string[] =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const toCredentialPayload = (
  rawCredential: string | null,
  authorization: string | null,
): Record<string, unknown> | undefined => {
  const credentialValue = rawCredential?.trim();
  const authorizationValue = authorization?.trim();
  let parsedCredential: Record<string, unknown> | undefined;

  if (credentialValue) {
    try {
      const parsed = JSON.parse(credentialValue) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        parsedCredential = parsed as Record<string, unknown>;
      } else {
        parsedCredential = { value: credentialValue };
      }
    } catch {
      parsedCredential = { value: credentialValue };
    }
  }

  if (!authorizationValue) {
    return parsedCredential;
  }

  return {
    ...(parsedCredential ?? {}),
    authorization: authorizationValue,
  };
};

export const bindHostedAuthContext = (request: Request): PluginAuthContext => {
  // Preferred hosted AtoM headers are x-atom-* variants. Generic fallbacks are
  // accepted temporarily so existing host wrappers can migrate without breaking
  // runtime binding during rollout.
  const userIdHeader =
    request.headers.get('x-atom-user-id') || request.headers.get('x-user-id');
  const rolesHeader =
    request.headers.get('x-atom-user-roles') ||
    request.headers.get('x-atom-roles');
  const permissionsHeader =
    request.headers.get('x-atom-user-permissions') ||
    request.headers.get('x-atom-permissions');

  return {
    userId: userIdHeader?.trim() || undefined,
    roles: splitCommaSeparatedHeader(rolesHeader),
    permissions: splitCommaSeparatedHeader(permissionsHeader),
    credential: toCredentialPayload(
      request.headers.get('x-atom-credential'),
      request.headers.get('authorization'),
    ),
  };
};

let hostedRuntime: PluginScaffold | null = null;

export const getHostedPluginRuntime = (): PluginScaffold => {
  if (!hostedRuntime) {
    hostedRuntime = bootstrapPlugin(createHostedDomainServices());
  }
  return hostedRuntime;
};

export const __resetHostedPluginRuntimeForTesting = (): void => {
  hostedRuntime = null;
};
