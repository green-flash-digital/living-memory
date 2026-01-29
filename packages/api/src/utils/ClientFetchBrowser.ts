import { ClientFetch, type ClientFetchArgs } from "./ClientFetch.js";

// Browser-specific RequestInit that includes credentials (not available in Cloudflare Workers)
// The credentials property is part of the standard Web API but not in Cloudflare's RequestInit
type BrowserRequestInit = RequestInit & {
  credentials?: "omit" | "same-origin" | "include";
};

export class ClientFetchBrowser extends ClientFetch {
  constructor(args: ClientFetchArgs) {
    super(args);
  }

  /**
   * Browser version creates empty headers (doesn't need Request object).
   */
  protected _prepareHeaders(_request?: Request): Headers {
    return new Headers();
  }

  /**
   * Browser version adds credentials: "include" to send cookies automatically.
   */
  protected _getRequestInitOptions(): Partial<BrowserRequestInit> {
    return {
      credentials: "include"
    };
  }
}
