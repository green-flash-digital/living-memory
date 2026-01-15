import { createAuthClient } from "better-auth/client";
import type { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";

function createClient(baseUrl: string) {
  return createAuthClient({
    baseUrl,
    plugins: [inferAdditionalFields<typeof auth>()],
  });
}

export class MemoriesApiClientServer {
  auth: ReturnType<typeof createClient>;

  constructor(args: { baseUrl: string }) {
    console.log(args);
    this.auth = createClient(args.baseUrl);
  }
}
