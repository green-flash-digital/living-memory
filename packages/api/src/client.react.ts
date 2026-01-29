import {
  inferAdditionalFields,
  organizationClient,
  inferOrgAdditionalFields,
  deviceAuthorizationClient
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { AuthInstance } from "./auth.js";
import { OnboardingClientBrowser } from "./features/onboarding/onboarding.clients.js";
import { PlaylistsClientBrowser } from "./features/playlists/playlists.clients.js";
import type { ClientFetchResult } from "./utils/ClientFetch.js";
export * from "./db/enums.js";

function createClient(baseURL: string) {
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
/**
 * Client-side API client intended for use in React applications.
 * This variant is specifically configured for use in the browser.
 */

export class MemoriesApiClientReact {
  auth: ReturnType<typeof createClient>;
  onboarding: OnboardingClientBrowser;
  playlists: PlaylistsClientBrowser;

  constructor(args: { baseURL: string }) {
    this.auth = createClient(args.baseURL);
    this.onboarding = new OnboardingClientBrowser(args);
    this.playlists = new PlaylistsClientBrowser(args);
  }
}

// Re-export types for easier consumption
export type { ClientFetchResult };
