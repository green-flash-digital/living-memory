import { createAuthClient } from "better-auth/client";
import type { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";

function createClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<typeof auth>()],
  });
}

export class MemoriesApiClientServer {
  auth: ReturnType<typeof createClient>;

  constructor(args: { baseURL: string }) {
    this.auth = createClient(args.baseURL);
  }
}
