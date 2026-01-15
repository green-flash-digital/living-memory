import { createAuthClient } from "better-auth/client";
import type { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";

function createBetterAuthClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<typeof auth>()],
  });
}

class AuthClient {
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

export class MemoriesApiClientServer {
  auth: AuthClient;

  constructor(args: { baseURL: string }) {
    this.auth = new AuthClient(args);
  }
}
