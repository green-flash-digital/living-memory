import type { ContextAndRequest, Session } from "./util.server.types";
import { env } from "cloudflare:workers";
import { tryHandle } from "~/utils";

/**
 * Server-side client for handling authentication API requests during SSR.
 *
 * This class provides a secure and consistent interface for server-side rendering (SSR) code
 * to interact with authentication endpoints, such as verifying the current session.
 * By centralizing all auth API access here, we ensure that server-side handlers have robust,
 * API-backed authentication, as opposed to fragile or easily-bypassed client-only approaches.
 *
 * This enables secure, reliable authentication checks during SSR, preventing unauthorized access to protected pages,
 * and sets the foundation for seamless integration with backend-only session validation.
 *
 * Handles error processing and response parsing for the consuming application.
 */
export class SSRAuthClient {
  #rootUrl: string;

  constructor() {
    this.#rootUrl = `${env.API_DOMAIN}/api/auth`;
  }

  /**
   * Internal helper to fetch and parse JSON, throwing with useful error details if the response is not ok or JSON parsing fails.
   */
  async #fetch<R>(endpoint: string, init: RequestInit): Promise<R> {
    const url = this.#rootUrl.concat(endpoint);
    const reqInit: RequestInit = { ...init, credentials: "include" };
    const tRes = await tryHandle(fetch(url, reqInit));
    if (!tRes.success) {
      // network or fetch error
      console.error(`Fetch failed for ${url}:`, tRes.error);
      throw new Error(`Network error while fetching ${url}`);
    }
    const { data: res } = tRes;

    if (!res.ok) {
      // failed request
      const resText = await res.text().catch(() => undefined);
      console.error(`Fetch failed with status ${res.status}:`, resText);
      throw new Error(
        `Failed request [${res.status}]: ${resText ?? res.statusText}`
      );
    }

    const tJson = await tryHandle<R>(res.json());
    if (!tJson.success) {
      // failed json parsing
      const resText = await res.clone().text();
      const { error } = tJson;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Failed to parse JSON from ${url}:`, resText ?? errorMsg);
      throw new Error(`Failed to parse JSON response from ${url}: ${errorMsg}`);
    }

    return tJson.data;
  }

  /**
   * Gets the current session from the auth API.
   * Returns null if no valid session exists.
   */
  async getSession<T extends ContextAndRequest>(args: T) {
    return this.#fetch<Session | null>("/get-session", {
      headers: args.request.headers,
    });
  }
}

export const AuthClientSSR = new SSRAuthClient();
