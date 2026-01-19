import { exhaustiveMatchGuard, tryHandle } from "@living-memory/utils";
import { z, type ZodType } from "zod";
import { ErrorResponseSchema, HTTPError, type ErrorResponse } from "./ApiError.js";

// Re-export error types for convenience
export type { ErrorResponse };

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

  #getContentType(headers: Headers) {
    const contentType = headers.get("Content-Type") ?? "";
    // Extract the MIME type (ignore charset and other parameters)
    const mimeType = contentType.split(";")[0].trim().toLowerCase();

    if (mimeType === "application/json" || mimeType.endsWith("+json")) {
      return "json" as const;
    }
    if (mimeType.startsWith("text/")) {
      return "text" as const;
    }
    if (
      mimeType.startsWith("image/") ||
      mimeType.startsWith("video/") ||
      mimeType.startsWith("audio/") ||
      mimeType === "application/octet-stream" ||
      mimeType === "application/pdf" ||
      mimeType === "application/zip"
    ) {
      return "blob" as const;
    }
    return "unknown";
  }

  /**
   * Helper to create an error response from an unknown error.
   * Extracts the error message and creates a ServerError.
   */
  #errorResponse(
    error: unknown,
    context: string,
    url: string
  ): { success: false; error: ErrorResponse } {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`${context} from ${url}:`, errorMsg);
    const serverError = HTTPError.serverError(`${context} from ${url}: ${errorMsg}`);
    return { success: false, error: serverError.toJson() };
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
    const fetchRes = await tryHandle(fetch(url, init));

    // Network or fetch error - return as ErrorResponse
    if (!fetchRes.success) {
      const message = "Network error while fetching";
      return this.#errorResponse(fetchRes.error, message, url);
    }

    // Get the full response
    const res = fetchRes.data;
    const contentType = this.#getContentType(res.headers);
    const contentTypeRaw = res.headers.get("Content-Type") ?? "(not set)";
    const contentLength = res.headers.get("Content-Length");

    // Failed to fetch + JSON
    if (!res.ok && contentType === "json") {
      const jsonErr = await tryHandle(res.json());
      if (jsonErr.success) {
        // Validate and parse as ErrorResponse
        const parsed = ErrorResponseSchema.safeParse(jsonErr.data);
        if (parsed.success) {
          console.error(
            `API error [${parsed.data.status}] ${parsed.data.error_type}:`,
            parsed.data.message
          );
          return { success: false, error: parsed.data };
        }
      }
    }

    // Failed to fetch
    if (!res.ok) {
      const textErr = await res.text().catch(() => "Unknown");
      console.error(`Fetch failed with status ${res.status}:`, textErr);
      const fallbackError = HTTPError.unknown(textErr, res.status);
      return { success: false, error: fallbackError.toJson() };
    }

    // Fetch Successful - Empty response (204 No Content, etc.)
    if (contentLength === "0" || res.status === 204) {
      return { success: true, data: undefined as R };
    }

    // Fetch Successful - parse the request
    switch (contentType) {
      case "blob":
        const blob = await tryHandle<Blob>(res.blob());
        if (!blob.success) {
          const message = "Failed to read Blob response";
          return this.#errorResponse(blob.error, message, url);
        }
        return { success: true, data: blob.data as R };

      case "text":
        const tText = await tryHandle<string>(res.text());
        if (!tText.success) {
          const message = "Failed to read text response";
          return this.#errorResponse(tText.error, message, url);
        }
        return { success: true, data: tText.data as R };

      case "json":
        const tJson = await tryHandle<R>(res.json());
        // failed json parsing
        if (!tJson.success) {
          const message = await res
            .clone()
            .text()
            .catch(() => "Unable to read response body");
          return this.#errorResponse(tJson.error, message, url);
        }
        return { success: true, data: tJson.data };

      case "unknown":
        const message = `Content type not recognized: ${contentTypeRaw}`;
        const error = HTTPError.serverError(message).toJson();
        return { success: false, error };

      default:
        exhaustiveMatchGuard(contentType);
    }
  }
}
