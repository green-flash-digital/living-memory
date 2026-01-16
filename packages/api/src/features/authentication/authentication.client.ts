import { createAuthClient } from "better-auth/client";
import {
  inferAdditionalFields,
  organizationClient,
  inferOrgAdditionalFields,
  deviceAuthorizationClient,
} from "better-auth/client/plugins";
import type { auth } from "../../auth";

function createBetterAuthClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [
      inferAdditionalFields<typeof auth>(),
      organizationClient({
        schema: inferOrgAdditionalFields<typeof auth>(),
      }),
      deviceAuthorizationClient(),
    ],
  });
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
