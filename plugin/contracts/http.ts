export type PluginHttpMethod = 'GET' | 'POST';

export interface PluginAuthContext {
  userId?: string;
  roles?: string[];
  permissions?: string[];
  credential?: Record<string, unknown>;
}

export interface PluginHttpRequest<
  TBody = unknown,
  TQuery extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
> {
  body?: TBody;
  query?: TQuery;
  auth?: PluginAuthContext;
}

export interface PluginHttpResponse<TBody> {
  status: number;
  body: TBody;
}

export interface PluginApiError {
  code: string;
  message: string;
}

export interface PluginSuccessListResponse<TItem> {
  success: true;
  data: {
    items: TItem[];
    total: number;
  };
}

export interface PluginSuccessEntityResponse<TEntity> {
  success: true;
  data: TEntity;
}

export interface PluginErrorResponse {
  success: false;
  error: PluginApiError;
}

export type PluginApiResponse<TData> =
  | PluginSuccessEntityResponse<TData>
  | PluginErrorResponse;

export type PluginApiListResponse<TItem> =
  | PluginSuccessListResponse<TItem>
  | PluginErrorResponse;

export interface PluginRouteDefinition {
  method: PluginHttpMethod;
  path: string;
  handler: (
    request: PluginHttpRequest,
  ) => Promise<PluginHttpResponse<unknown>> | PluginHttpResponse<unknown>;
}
