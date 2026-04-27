import type { PluginAuthContext } from '../contracts/http';

type AtomAclLike = {
  check?: (permission: string, credential?: unknown) => boolean;
  isGranted?: (permission: string, credential?: unknown) => boolean;
};

const PLUGIN_PERMISSION_MAP: Record<string, string> = {
  'actors:read': 'read',
  'actors:create': 'create',
  'events:read': 'read',
  'events:create': 'create',
  'claims:read': 'read',
  'claims:create': 'create',
  'claims:linkages:read': 'read',
  'claims:linkages:create': 'update',
  'victims:read': 'read',
  'victims:create': 'create',
  'perpetrators:read': 'read',
  'perpetrators:create': 'create',
  'participants:read': 'read',
  'participants:create': 'create',
};

const hasRoleOverride = (authContext: PluginAuthContext): boolean =>
  Boolean(authContext.roles?.some((role) => role === 'administrator'));

export const checkPermission = async (
  authContext: PluginAuthContext | undefined,
  permission: string,
): Promise<boolean> => {
  if (!authContext?.userId) {
    return false;
  }

  if (authContext.permissions?.includes(permission)) {
    return true;
  }

  const mappedPermission = PLUGIN_PERMISSION_MAP[permission] ?? permission;
  const qubitAcl = (globalThis as { QubitAcl?: AtomAclLike }).QubitAcl;
  const credential = authContext.credential;

  if (qubitAcl?.check) {
    return qubitAcl.check(mappedPermission, credential);
  }

  if (qubitAcl?.isGranted) {
    return qubitAcl.isGranted(mappedPermission, credential);
  }

  return hasRoleOverride(authContext);
};
