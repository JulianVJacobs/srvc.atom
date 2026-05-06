import type {
  PluginHttpMethod,
  PluginHttpRequest,
  PluginHttpResponse,
  PluginRouteDefinition,
} from '../contracts/http';
import type { PluginMenuEntry } from '../contracts/menu';

export class PluginScaffold {
  private readonly routes: PluginRouteDefinition[] = [];
  private readonly menuExtensions: PluginMenuEntry[] = [];

  registerRoute(route: PluginRouteDefinition): void {
    this.routes.push(route);
  }

  getRoutes(): PluginRouteDefinition[] {
    return [...this.routes];
  }

  registerMenuExtension(entry: PluginMenuEntry): void {
    this.menuExtensions.push(entry);
  }

  getMenuExtensions(): PluginMenuEntry[] {
    return [...this.menuExtensions];
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
