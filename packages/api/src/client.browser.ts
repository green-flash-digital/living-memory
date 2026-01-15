import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

function createClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<typeof auth>()],
  });
}

export class MemoriesApiClientBrowser {
  auth: ReturnType<typeof createClient>;

  constructor(args: { baseURL: string }) {
    this.auth = createClient(args.baseURL);
  }
}
