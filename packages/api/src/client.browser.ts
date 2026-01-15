import { createAuthClient } from "better-auth/react";
import { betterAuthClientConfig } from "./features/authentication/authentication.utils";

function createClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    ...betterAuthClientConfig,
  });
}

export class MemoriesApiClientBrowser {
  auth: ReturnType<typeof createClient>;

  constructor(args: { baseURL: string }) {
    this.auth = createClient(args.baseURL);
  }
}
