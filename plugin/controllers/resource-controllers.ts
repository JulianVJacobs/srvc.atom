import { checkPermission } from '../auth/checkPermission';
import { bindUserContext } from '../auth/user-context';
import type {
  PluginApiListResponse,
  PluginApiResponse,
  PluginHttpRequest,
  PluginHttpResponse,
} from '../contracts/http';
import type {
  ActorPayload,
  ClaimArchivalLinkPayload,
  ClaimRecordPayload,
  EventPayload,
  ListQuery,
  ListResult,
  PerpetratorPayload,
  ParticipantPayload,
  PluginDomainServices,
  VictimPayload,
} from '../contracts/plugin-api-contract';

type PermissionCheck = typeof checkPermission;

type PayloadByResource = {
  actors: ActorPayload;
  events: EventPayload;
  claims: ClaimRecordPayload;
  claimArchivalLinks: ClaimArchivalLinkPayload;
  victims: VictimPayload;
  perpetrators: PerpetratorPayload;
  participants: ParticipantPayload;
};

type CreateInputByResource = {
  [K in keyof PayloadByResource]: Omit<PayloadByResource[K], 'id'>;
};

export type ResourceKey = keyof PayloadByResource;

export interface ResourceControllerSet {
  list: (
    request: PluginHttpRequest,
  ) => Promise<PluginHttpResponse<PluginApiListResponse<PayloadByResource[ResourceKey]>>>;
  create: (
    request: PluginHttpRequest,
  ) => Promise<PluginHttpResponse<PluginApiResponse<PayloadByResource[ResourceKey]>>>;
}

const toInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBoundedInt = (
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => Math.min(max, Math.max(min, toInt(value, fallback)));

const toListQuery = (request: PluginHttpRequest): ListQuery => ({
  search: request.query?.search,
  limit: toBoundedInt(request.query?.limit, 25, 1, 100),
  offset: toBoundedInt(request.query?.offset, 0, 0, Number.MAX_SAFE_INTEGER),
});

const parseRequiredQuery = (
  request: PluginHttpRequest,
  key: string,
): { ok: true; value: string } | { ok: false } => {
  const value = request.query?.[key];
  if (!value || !value.trim()) {
    return { ok: false };
  }

  return { ok: true, value };
};

const parseBody = <T>(
  request: PluginHttpRequest,
): { ok: true; value: T } | { ok: false } => {
  if (!request.body || typeof request.body !== 'object') {
    return { ok: false };
  }

  return { ok: true, value: request.body as T };
};

const unauthorizedResponse = (): PluginHttpResponse<PluginApiResponse<unknown>> => ({
  status: 403,
  body: {
    success: false,
    error: {
      code: 'forbidden',
      message: 'Permission denied',
    },
  },
});

const badRequestResponse = (): PluginHttpResponse<PluginApiResponse<unknown>> => ({
  status: 400,
  body: {
    success: false,
    error: {
      code: 'invalid_request',
      message: 'Request body must be an object payload',
    },
  },
});

const missingQueryResponse = (key: string): PluginHttpResponse<PluginApiResponse<unknown>> => ({
  status: 400,
  body: {
    success: false,
    error: {
      code: 'invalid_request',
      message: `Missing required query parameter: ${key}`,
    },
  },
});

const listResponse = <T>(result: ListResult<T>): PluginHttpResponse<PluginApiListResponse<T>> => ({
  status: 200,
  body: {
    success: true,
    data: {
      items: result.items,
      total: result.total,
    },
  },
});

const createResponse = <T>(payload: T): PluginHttpResponse<PluginApiResponse<T>> => ({
  status: 201,
  body: {
    success: true,
    data: payload,
  },
});

export const createResourceControllers = (
  services: PluginDomainServices,
  permissionCheck: PermissionCheck = checkPermission,
): Record<ResourceKey, ResourceControllerSet> => ({
  actors: {
    list: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'actors:read'))) {
        return unauthorizedResponse();
      }
      const result = await services.actors.list(toListQuery(request), userContext);
      return listResponse(result);
    },
    create: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'actors:create'))) {
        return unauthorizedResponse();
      }
      const parsedBody = parseBody<CreateInputByResource['actors']>(request);
      if (!parsedBody.ok) return badRequestResponse();
      return createResponse(await services.actors.create(parsedBody.value, userContext));
    },
  },
  events: {
    list: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'events:read'))) {
        return unauthorizedResponse();
      }
      const result = await services.events.list(toListQuery(request), userContext);
      return listResponse(result);
    },
    create: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'events:create'))) {
        return unauthorizedResponse();
      }
      const parsedBody = parseBody<CreateInputByResource['events']>(request);
      if (!parsedBody.ok) return badRequestResponse();
      return createResponse(await services.events.create(parsedBody.value, userContext));
    },
  },
  claims: {
    list: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'claims:read'))) {
        return unauthorizedResponse();
      }
      const result = await services.claims.list(toListQuery(request), userContext);
      return listResponse(result);
    },
    create: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'claims:create'))) {
        return unauthorizedResponse();
      }
      const parsedBody = parseBody<CreateInputByResource['claims']>(request);
      if (!parsedBody.ok) return badRequestResponse();
      return createResponse(await services.claims.create(parsedBody.value, userContext));
    },
  },
  claimArchivalLinks: {
    list: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'claims:linkages:read'))) {
        return unauthorizedResponse();
      }
      const claimId = parseRequiredQuery(request, 'claimId');
      if (!claimId.ok) {
        return missingQueryResponse('claimId');
      }
      const result = await services.claimArchivalLinks.listByClaimId(
        claimId.value,
        userContext,
      );
      return listResponse(result);
    },
    create: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'claims:linkages:create'))) {
        return unauthorizedResponse();
      }
      const parsedBody = parseBody<CreateInputByResource['claimArchivalLinks']>(request);
      if (!parsedBody.ok) return badRequestResponse();
      return createResponse(
        await services.claimArchivalLinks.create(parsedBody.value, userContext),
      );
    },
  },
  victims: {
    list: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'victims:read'))) {
        return unauthorizedResponse();
      }
      const result = await services.victims.list(toListQuery(request), userContext);
      return listResponse(result);
    },
    create: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'victims:create'))) {
        return unauthorizedResponse();
      }
      const parsedBody = parseBody<CreateInputByResource['victims']>(request);
      if (!parsedBody.ok) return badRequestResponse();
      return createResponse(await services.victims.create(parsedBody.value, userContext));
    },
  },
  perpetrators: {
    list: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'perpetrators:read'))) {
        return unauthorizedResponse();
      }
      const result = await services.perpetrators.list(toListQuery(request), userContext);
      return listResponse(result);
    },
    create: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'perpetrators:create'))) {
        return unauthorizedResponse();
      }
      const parsedBody = parseBody<CreateInputByResource['perpetrators']>(request);
      if (!parsedBody.ok) return badRequestResponse();
      return createResponse(
        await services.perpetrators.create(parsedBody.value, userContext),
      );
    },
  },
  participants: {
    list: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'participants:read'))) {
        return unauthorizedResponse();
      }
      const result = await services.participants.list(toListQuery(request), userContext);
      return listResponse(result);
    },
    create: async (request) => {
      const userContext = bindUserContext(request.auth);
      if (!(await permissionCheck(request.auth, 'participants:create'))) {
        return unauthorizedResponse();
      }
      const parsedBody = parseBody<CreateInputByResource['participants']>(request);
      if (!parsedBody.ok) return badRequestResponse();
      return createResponse(
        await services.participants.create(parsedBody.value, userContext),
      );
    },
  },
});
