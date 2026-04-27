import type { PluginAuthContext } from '../contracts/http';
import type { PluginUserContext } from '../contracts/plugin-api-contract';

export const bindUserContext = (
  authContext: PluginAuthContext | undefined,
): PluginUserContext => ({
  userId: authContext?.userId ?? null,
  roles: authContext?.roles ?? [],
  permissions: authContext?.permissions ?? [],
  credential: authContext?.credential,
});
