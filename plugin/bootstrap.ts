import { PluginScaffold } from './scaffold/plugin-scaffold';
import { registerPluginRoutes } from './routes/register-plugin-routes';
import type { PluginDomainServices } from './contracts/plugin-api-contract';

export interface PluginConfig {
  name: string;
  version: string;
  description: string;
  pluginId: string;
}

export const PLUGIN_CONFIG: PluginConfig = {
  name: process.env.npm_package_name ?? 'homicide-media-tracker',
  version: process.env.npm_package_version ?? '2.2.0',
  description:
    process.env.npm_package_description ??
    'An application to track (homicide) media.',
  pluginId: 'access-homicide-tracker',
};

export function bootstrapPlugin(services: PluginDomainServices): PluginScaffold {
  const plugin = new PluginScaffold();

  plugin.registerRoute({
    method: 'GET',
    path: '/',
    handler: () => ({
      status: 200,
      body: {
        success: true,
        data: {
          registered: true,
          name: PLUGIN_CONFIG.name,
          version: PLUGIN_CONFIG.version,
          description: PLUGIN_CONFIG.description,
          pluginId: PLUGIN_CONFIG.pluginId,
        },
      },
    }),
  });

  registerPluginRoutes(plugin, services);

  return plugin;
}
