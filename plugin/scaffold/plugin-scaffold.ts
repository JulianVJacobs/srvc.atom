import type {
  PluginHttpMethod,
  PluginHttpRequest,
  PluginHttpResponse,
  PluginRouteDefinition,
} from '../contracts/http';

export class PluginScaffold {
  private readonly routes: PluginRouteDefinition[] = [];

  registerRoute(route: PluginRouteDefinition): void {
    this.routes.push(route);
  }

  getRoutes(): PluginRouteDefinition[] {
    return [...this.routes];
  }

  async dispatch(
    method: PluginHttpMethod,
    path: string,
    request: PluginHttpRequest = {},
  ): Promise<PluginHttpResponse<unknown>> {
    const route = this.routes.find(
      (registeredRoute) =>
        registeredRoute.method === method && registeredRoute.path === path,
    );

    if (!route) {
      return {
        status: 404,
        body: {
          success: false,
          error: {
            code: 'not_found',
            message: 'Route not found',
          },
        },
      };
    }

    return route.handler(request);
  }
}
