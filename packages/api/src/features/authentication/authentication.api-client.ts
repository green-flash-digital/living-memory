import { createAuthClient } from "better-auth/client";
import {
  inferAdditionalFields,
  organizationClient,
  inferOrgAdditionalFields,
  deviceAuthorizationClient
} from "better-auth/client/plugins";
import type { AuthInstance } from "../../auth.js";

function createBetterAuthClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [
      inferAdditionalFields<AuthInstance>(),
      organizationClient({
        schema: inferOrgAdditionalFields<AuthInstance>()
      }),
      deviceAuthorizationClient()
    ]
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

  /**
   * Returns the users active household
   */
  getActiveHousehold(request: Request) {
    return this.raw.organization.getFullOrganization({}, { headers: request.headers });
  }
}
