import { createResourceControllers } from '../controllers/resource-controllers';
import type { PluginDomainServices } from '../contracts/plugin-api-contract';
import type { PluginScaffold } from '../scaffold/plugin-scaffold';

export const registerPluginRoutes = (
  plugin: PluginScaffold,
  services: PluginDomainServices,
): void => {
  const controllers = createResourceControllers(services);

  plugin.registerRoute({
    method: 'GET',
    path: '/actors',
    handler: controllers.actors.list,
  });
  plugin.registerRoute({
    method: 'POST',
    path: '/actors',
    handler: controllers.actors.create,
  });

  plugin.registerRoute({
    method: 'GET',
    path: '/events',
    handler: controllers.events.list,
  });
  plugin.registerRoute({
    method: 'POST',
    path: '/events',
    handler: controllers.events.create,
  });

  plugin.registerRoute({
    method: 'GET',
    path: '/claims',
    handler: controllers.claims.list,
  });
  plugin.registerRoute({
    method: 'POST',
    path: '/claims',
    handler: controllers.claims.create,
  });
  plugin.registerRoute({
    method: 'GET',
    path: '/claim-linkages',
    handler: controllers.claimArchivalLinks.list,
  });
  plugin.registerRoute({
    method: 'POST',
    path: '/claim-linkages',
    handler: controllers.claimArchivalLinks.create,
  });

  plugin.registerRoute({
    method: 'GET',
    path: '/victims',
    handler: controllers.victims.list,
  });
  plugin.registerRoute({
    method: 'POST',
    path: '/victims',
    handler: controllers.victims.create,
  });

  plugin.registerRoute({
    method: 'GET',
    path: '/perpetrators',
    handler: controllers.perpetrators.list,
  });
  plugin.registerRoute({
    method: 'POST',
    path: '/perpetrators',
    handler: controllers.perpetrators.create,
  });

  plugin.registerRoute({
    method: 'GET',
    path: '/participants',
    handler: controllers.participants.list,
  });
  plugin.registerRoute({
    method: 'POST',
    path: '/participants',
    handler: controllers.participants.create,
  });
};
