import { OnboardingClient } from "./features/onboarding/onboarding.clients.js";
import { AuthClient } from "./features/authentication/authentication.api-client.js";
import { HouseholdClient } from "./features/household/household.clients.js";
import { PlaylistsClient } from "./features/playlists/playlists.clients.js";

export type { ClientFetchResult } from "./utils/ClientFetch.js";

export * from "./db/enums.js";

export class MemoriesApiClientSSR {
  auth: AuthClient;
  onboarding: OnboardingClient;
  household: HouseholdClient;
  playlists: PlaylistsClient;

  constructor(args: { baseURL: string }) {
    this.auth = new AuthClient(args);
    this.onboarding = new OnboardingClient(args);
    this.household = new HouseholdClient(args);
    this.playlists = new PlaylistsClient(args);
  }
}
