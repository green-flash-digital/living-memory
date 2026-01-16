import {
  inferAdditionalFields,
  organizationClient,
  inferOrgAdditionalFields,
  deviceAuthorizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

function createClient(baseURL: string) {
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
/**
 * Client-side API client intended for use in React applications.
 * This variant is specifically configured for use in the browser.
 */

export class MemoriesApiClientReact {
  auth: ReturnType<typeof createClient>;

  constructor(args: { baseURL: string }) {
    this.auth = createClient(args.baseURL);
  }
}
