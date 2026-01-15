import { createAuthClient } from "better-auth/client";
import { betterAuthClientConfig } from "./features/authentication/authentication.utils";
import { OnboardingClient } from "./features/onboarding/onboarding.client";

function createClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    ...betterAuthClientConfig,
  });
}

class AuthClient {
  #raw: ReturnType<typeof createClient>;

  constructor(args: { baseURL: string }) {
    this.#raw = createClient(args.baseURL);
  }

  /**
   * Retrieves the current authentication session for the given request.
   */
  getSession(request: Request) {
    return this.#raw.getSession({ fetchOptions: { headers: request.headers } });
  }
}

export class MemoriesApiClientServer {
  auth: AuthClient;
  onboarding: OnboardingClient;

  constructor(args: { baseURL: string }) {
    this.auth = new AuthClient(args);
    this.onboarding = new OnboardingClient(args);
  }
}
