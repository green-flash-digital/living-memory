import { OnboardingClient } from "./features/onboarding/onboarding.client";
import { AuthClient } from "./features/authentication/authentication.client.js";

console.log({ typeOfAuthClient: typeof AuthClient });

export class MemoriesApiClientSSR {
  auth: AuthClient;
  onboarding: OnboardingClient;

  constructor(args: { baseURL: string }) {
    this.auth = new AuthClient(args);
    this.onboarding = new OnboardingClient(args);
  }
}
