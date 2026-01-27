import { tryFetch, type ErrorResponse } from "@living-memory/utils";
import { z, type ZodType } from "zod";

export type ClientFetchArgs = { baseURL: string };

/**
 * Result type for ClientFetch operations.
 * Uses a discriminated union to represent success or error states.
 */
export type ClientFetchResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorResponse };

export class ClientFetch {
  protected _baseURL: string;

  constructor({ baseURL }: ClientFetchArgs) {
    this._baseURL = baseURL;
  }


  /**
   * Copies all headers from the provided Request object into a new Headers instance.
   */
  _makeHeaders(request: Request) {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    return headers;
  }

  /**
   * Protected method for GET requests with optional schema validation.
   * Validates params and query before making the request if schemas are provided.
   * Subclasses can override _prepareHeaders and _getRequestInitOptions to customize behavior.
   */
  protected async _get<T = unknown, Q extends ZodType = ZodType>({
    path,
    query,
    request
  }: {
    path: string;
    query?: [schema: Q, data: z.infer<Q> | undefined];
    request?: Request;
  }): Promise<ClientFetchResult<T>> {
    const queryString = this._makeQueryString(query);
    const endpoint = this._makeEndpoint({ path, queryString });
    const headers = this._prepareHeaders(request);
    const additionalOptions = this._getRequestInitOptions();

    return this._fetch<T>(endpoint, {
      headers,
      ...additionalOptions
    });
  }

  /**
   * Helper for mutation requests (POST, PUT, PATCH, DELETE).
   * Handles JSON and FormData bodies.
   * Subclasses can override _prepareHeaders and _getRequestInitOptions to customize behavior.
   */
  protected async _mutate<R = unknown, B extends ZodType = ZodType, Q extends ZodType = ZodType>({
    path,
    method,
    body,
    query,
    request
  }: {
    path: string;
    method: "POST" | "PUT" | "PATCH" | "DELETE";
    body?: [schema: B, data: z.infer<B>] | FormData;
    query?: [schema: Q, data: z.infer<Q> | undefined];
    request?: Request;
  }): Promise<ClientFetchResult<R>> {
    const queryString = this._makeQueryString(query);
    const endpoint = this._makeEndpoint({ path, queryString });
    const requestBody = this._makeBody(body);
    const headers = this._prepareHeaders(request);
    const additionalOptions = this._getRequestInitOptions();

    // Set Content-Type only for JSON bodies
    // For FormData, let the browser set the Content-Type with boundary automatically
    if (requestBody !== undefined && typeof requestBody === "string") {
      headers.set("Content-Type", "application/json");
    }

    return this._fetch<R>(endpoint, {
      method,
      headers,
      body: requestBody,
      ...additionalOptions
    });
  }

  /**
   * Prepares headers for the request. Override in subclasses to customize header handling.
   */
  protected _prepareHeaders(request?: Request): Headers {
    if (request) {
      return this._makeHeaders(request);
    }
    return new Headers();
  }

  /**
   * Returns additional RequestInit options. Override in subclasses to add browser-specific options.
   * @returns Partial RequestInit with additional options (e.g., credentials for browser)
   */
  protected _getRequestInitOptions(): Partial<RequestInit> {
    return {};
  }

  /**
   * Private helper to build query string from validated query data.
   */
  _makeQueryString<Q extends ZodType = ZodType>(
    query?: [schema: Q, data: z.infer<Q> | undefined]
  ): string {
    if (!query) return "";

    const [schema, value] = query;
    if (value === undefined) return "";

    const validated = schema.parse(value);
    const searchParams = new URLSearchParams();

    if (validated && typeof validated === "object" && !Array.isArray(validated)) {
      Object.entries(validated as Record<string, unknown>).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          // Handle arrays by appending each value
          if (Array.isArray(val)) {
            val.forEach((item) => {
              if (item !== undefined && item !== null) {
                searchParams.append(key, String(item));
              }
            });
          } else {
            searchParams.append(key, String(val));
          }
        }
      });
    }

    return searchParams.toString();
  }

  /**
   * Private helper to build the full URL from path and query string.
   * Combines path + query string, then normalizes with baseURL.
   * Handles trailing/leading slashes between baseURL and path.
   */
  _makeEndpoint(args: { path: string; queryString: string }): string {
    // Combine pathname + query string
    let relativePath = args.path;
    if (args.queryString) {
      // Handle case where pathname already has query parameters
      const separator = args.path.includes("?") ? "&" : "?";
      relativePath = `${args.path}${separator}${args.queryString}`;
    }

    // Normalize baseURL - remove trailing slash
    const baseURL = this._baseURL.endsWith("/") ? this._baseURL.slice(0, -1) : this._baseURL;

    // Normalize path - ensure it starts with /
    const normalizedPath = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

    return `${baseURL}${normalizedPath}`;
  }

  /**
   * Private helper to validate and prepare request body.
   * Handles both JSON (via Zod schema) and FormData.
   */
  _makeBody<B extends ZodType = ZodType>(
    body?: [schema: B, data: z.infer<B>] | FormData
  ): string | FormData | undefined {
    if (!body) return undefined;

    // Handle FormData directly
    if (body instanceof FormData) {
      return body;
    }

    // Handle JSON via Zod schema
    const [schema, value] = body;
    const validated = schema.parse(value);
    return JSON.stringify(validated);
  }

  protected async _fetch<R>(url: string, init: RequestInit): Promise<ClientFetchResult<R>> {
    return tryFetch<R>(url, init);
  }
}
