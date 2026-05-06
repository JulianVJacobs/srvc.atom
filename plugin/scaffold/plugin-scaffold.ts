import type {
  PluginHttpMethod,
  PluginHttpRequest,
  PluginHttpResponse,
  PluginMenuEntry,
  PluginRouteDefinition,
} from '../contracts/http';

export class PluginScaffold {
  private readonly routes: PluginRouteDefinition[] = [];
  private readonly menuEntries: PluginMenuEntry[] = [];

  registerRoute(route: PluginRouteDefinition): void {
    this.routes.push(route);
  }

  getRoutes(): PluginRouteDefinition[] {
    return [...this.routes];
  }

  registerMenuEntry(entry: PluginMenuEntry): void {
    this.menuEntries.push(entry);
  }

  getMenuEntries(): PluginMenuEntry[] {
    return [...this.menuEntries];
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
