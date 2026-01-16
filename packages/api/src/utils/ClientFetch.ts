import { exhaustiveMatchGuard, tryHandle } from "@living-memory/utils";
import { z, type ZodType } from "zod";

export type ClientFetchArgs = { baseURL: string };

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

  protected async _fetch<R>(url: string, init: RequestInit): Promise<R> {
    const tRes = await tryHandle(fetch(url, init));

    if (!tRes.success) {
      // network or fetch error
      console.error(`Fetch failed for ${url}:`, tRes.error);
      throw new Error(`Network error while fetching ${url}`);
    }
    const { data: res } = tRes;

    if (!res.ok) {
      // failed request - try to parse as JSON for better error messages
      const contentType = res.headers.get("Content-Type") ?? "";
      const isJsonError = contentType.includes("application/json");

      let errorMessage = res.statusText;
      if (isJsonError) {
        const tJson = await tryHandle<{ message?: string; error?: string }>(
          res.json()
        );
        if (tJson.success && tJson.data) {
          errorMessage = tJson.data.message || tJson.data.error || errorMessage;
        }
      } else {
        const resText = await res.text().catch(() => undefined);
        if (resText) {
          errorMessage =
            resText.length > 200 ? `${resText.substring(0, 200)}...` : resText;
        }
      }

      console.error(`Fetch failed with status ${res.status}:`, errorMessage);
      throw new Error(`Failed request [${res.status}]: ${errorMessage}`);
    }

    const contentType = this.#getContentType(res.headers);
    const rawContentType = res.headers.get("Content-Type") ?? "(not set)";

    switch (contentType) {
      case "blob":
        const blob = await tryHandle<Blob>(res.blob());
        if (!blob.success) {
          const err = blob.error;
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`Failed to read Blob from ${url}:`, errorMsg);
          throw new Error(
            `Failed to read Blob response from ${url}: ${errorMsg}`
          );
        }
        return blob.data as R;

      case "text":
        const tText = await tryHandle<string>(res.text());
        if (!tText.success) {
          const { error } = tText;
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error(`Failed to read text from ${url}:`, errorMsg);
          throw new Error(
            `Failed to read text response from ${url}: ${errorMsg}`
          );
        }
        return tText.data as R;

      case "json":
        // Handle empty responses (204 No Content, etc.)
        const contentLength = res.headers.get("Content-Length");
        if (contentLength === "0" || res.status === 204) {
          return undefined as R;
        }

        const json = await tryHandle<R>(res.json());
        if (!json.success) {
          // failed json parsing
          const resText = await res
            .clone()
            .text()
            .catch(() => "Unable to read response body");
          const err = json.error;
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(
            `Failed to parse JSON from ${url}:`,
            resText ?? errorMsg
          );
          throw new Error(
            `Failed to parse JSON response from ${url}: ${errorMsg}`
          );
        }
        return json.data;

      case "unknown":
        throw new Error(
          `Content type not recognized: ${rawContentType} from ${url}`
        );

      default:
        return exhaustiveMatchGuard(contentType);
    }
  }

  /**
   * Copies all headers from the provided Request object into a new Headers instance.
   */
  #makeHeaders(request: Request) {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    return headers;
  }

  /**
   * Private helper to build query string from validated query data.
   */
  #makeQueryString<Q extends ZodType = ZodType>(
    query?: [schema: Q, data: z.infer<Q> | undefined]
  ): string {
    if (!query) return "";

    const [schema, value] = query;
    if (value === undefined) return "";

    const validated = schema.parse(value);
    const searchParams = new URLSearchParams();

    if (
      validated &&
      typeof validated === "object" &&
      !Array.isArray(validated)
    ) {
      Object.entries(validated as Record<string, unknown>).forEach(
        ([key, val]) => {
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
        }
      );
    }

    return searchParams.toString();
  }

  /**
   * Private helper to build the full URL from path and query string.
   * Combines path + query string, then normalizes with baseURL.
   * Handles trailing/leading slashes between baseURL and path.
   */
  #makeEndpoint(args: { path: string; queryString: string }): string {
    // Combine pathname + query string
    let relativePath = args.path;
    if (args.queryString) {
      // Handle case where pathname already has query parameters
      const separator = args.path.includes("?") ? "&" : "?";
      relativePath = `${args.path}${separator}${args.queryString}`;
    }

    // Normalize baseURL - remove trailing slash
    const baseURL = this._baseURL.endsWith("/")
      ? this._baseURL.slice(0, -1)
      : this._baseURL;

    // Normalize path - ensure it starts with /
    const normalizedPath = relativePath.startsWith("/")
      ? relativePath
      : `/${relativePath}`;

    return `${baseURL}${normalizedPath}`;
  }

  /**
   * Private helper to validate and prepare request body.
   * Handles both JSON (via Zod schema) and FormData.
   */
  #prepareBody<B extends ZodType = ZodType>(
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

  /**
   * Protected method for GET requests with optional schema validation.
   * Validates params and query before making the request if schemas are provided.
   */
  protected async _get<T = unknown, Q extends ZodType = ZodType>({
    path,
    query,
    request,
  }: {
    path: string;
    query?: [schema: Q, data: z.infer<Q> | undefined];
    request: Request;
  }): Promise<T> {
    // Validate and build query string, then build full endpoint URL
    const queryString = this.#makeQueryString(query);
    const endpoint = this.#makeEndpoint({ path, queryString });
    const headers = this.#makeHeaders(request);

    return this._fetch<T>(endpoint, { headers });
  }

  /**
   * Helper for mutation requests (POST, PUT, PATCH, DELETE).
   * Handles JSON and FormData bodies.
   */
  protected async _mutate<
    R = unknown,
    B extends ZodType = ZodType,
    Q extends ZodType = ZodType,
  >({
    path,
    method,
    body,
    query,
    request,
  }: {
    path: string;
    method: "POST" | "PUT" | "PATCH" | "DELETE";
    body?: [schema: B, data: z.infer<B>] | FormData;
    query?: [schema: Q, data: z.infer<Q> | undefined];
    request: Request;
  }): Promise<R> {
    // Validate and build query string, then build full endpoint URL
    const queryString = this.#makeQueryString(query);
    const endpoint = this.#makeEndpoint({ path, queryString });

    // Prepare the body
    const requestBody = this.#prepareBody(body);

    // Build headers - only copy headers from request, don't spread the entire request object
    const headers = this.#makeHeaders(request);

    // Set Content-Type only for JSON bodies
    // For FormData, let the browser set the Content-Type with boundary automatically
    if (requestBody !== undefined && typeof requestBody === "string") {
      headers.set("Content-Type", "application/json");
    }

    return this._fetch<R>(endpoint, {
      method,
      headers,
      body: requestBody,
    });
  }
}
