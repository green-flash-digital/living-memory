import { createAuthClient } from "better-auth/client";
import { betterAuthClientConfig } from "./authentication.utils";

function createBetterAuthClient(baseURL: string) {
  return createAuthClient({ baseURL, ...betterAuthClientConfig });
}

export class AuthClient {
  raw: ReturnType<typeof createBetterAuthClient>;

  constructor(args: { baseURL: string }) {
    this.raw = createBetterAuthClient(args.baseURL);
  }

  /**
   * Retrieves the current authentication session for the given request.
   */
  getSession(request: Request) {
    return this.raw.getSession({ fetchOptions: { headers: request.headers } });
  }
}
