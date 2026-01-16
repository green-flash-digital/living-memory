import { OnboardingClient } from "./features/onboarding/onboarding.client.js";
import { AuthClient } from "./features/authentication/authentication.client.js";

export class MemoriesApiClientSSR {
  auth: AuthClient;
  onboarding: OnboardingClient;

  constructor(args: { baseURL: string }) {
    this.auth = new AuthClient(args);
    this.onboarding = new OnboardingClient(args);
  }
}
