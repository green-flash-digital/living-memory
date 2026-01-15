import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

function createClient(baseUrl: string) {
  return createAuthClient({
    baseUrl,
    plugins: [inferAdditionalFields<typeof auth>()],
  });
}

export class MemoriesApiClientBrowser {
  auth: ReturnType<typeof createClient>;

  constructor(args: { baseUrl: string }) {
    this.auth = createClient(args.baseUrl);
  }
}
