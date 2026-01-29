import { ErrorResponseSchema, HTTPError, type ErrorResponse } from "./HTTPError.js";
import { exhaustiveMatchGuard } from "./util.exhaustiveMatchGuard.js";
import { tryHandle } from "./util.try-handle.js";

/**
 * Result type for fetch operations.
 * Uses a discriminated union to represent success or error states.
 */
export type FetchResponseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorResponse };

/**
 * Determines the content type from response headers.
 * Returns a simplified type: "json", "text", "blob", or "unknown".
 */
function getContentType(headers: Headers): "json" | "text" | "blob" | "unknown" {
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
function errorResponse(
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
 * Fetches a URL and parses the response based on content type.
 * Handles JSON, text, and blob responses with proper error handling.
 *
 * @param url - The URL to fetch
 * @param init - Optional RequestInit options (method, headers, body, etc.)
 * @returns A Promise that resolves to a FetchResponseResult with parsed data or error
 *
 * @example
 * ```ts
 * const result = await tryFetch<Status>("/status");
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function tryFetch<R>(
  url: string,
  init?: RequestInit
): Promise<FetchResponseResult<R>> {
  const fetchRes = await tryHandle(fetch(url, init));

  // Network or fetch error - return as ErrorResponse
  if (!fetchRes.success) {
    const message = "Network error while fetching";
    return errorResponse(fetchRes.error, message, url);
  }

  // Get the full response
  const res = fetchRes.data;
  const contentType = getContentType(res.headers);
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
        return errorResponse(blob.error, message, url);
      }
      return { success: true, data: blob.data as R };

    case "text":
      const tText = await tryHandle<string>(res.text());
      if (!tText.success) {
        const message = "Failed to read text response";
        return errorResponse(tText.error, message, url);
      }
      return { success: true, data: tText.data as R };

    case "json":
      const tJson = await tryHandle<unknown>(res.json());
      // failed json parsing
      if (!tJson.success) {
        const message = await res
          .clone()
          .text()
          .catch(() => "Unable to read response body");
        return errorResponse(tJson.error, message, url);
      }
      return { success: true, data: tJson.data as R };

    case "unknown":
      const message = `Content type not recognized: ${contentTypeRaw}`;
      const error = HTTPError.serverError(message).toJson();
      return { success: false, error };

    default:
      exhaustiveMatchGuard(contentType);
  }
}
