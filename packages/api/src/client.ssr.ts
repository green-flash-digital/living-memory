import { OnboardingClient } from "./features/onboarding/onboarding.api-client.js";
import { AuthClient } from "./features/authentication/authentication.api-client.js";
import { HouseholdClient } from "./features/household/household.api-client.js";
import type { ClientFetchResult } from "./utils/ClientFetch.js";

export class MemoriesApiClientSSR {
  auth: AuthClient;
  onboarding: OnboardingClient;
  household: HouseholdClient;

  constructor(args: { baseURL: string }) {
    this.auth = new AuthClient(args);
    this.onboarding = new OnboardingClient(args);
    this.household = new HouseholdClient(args);
  }
}

// Re-export types for easier consumption
export type { ClientFetchResult };
export type {
  CreateHouseholdRequest,
  CreateHouseholdResponse
} from "./features/onboarding/onboarding.api-client.js";
