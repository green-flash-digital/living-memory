import { createAuthClient } from "better-auth/react";
import { EnvVar } from "./EnvVar";

export const authClient = createAuthClient({
  baseURL: EnvVar.get("API_DOMAIN"),
  fetchOptions: {
    credentials:
      EnvVar.get("LIVING_MEMORY_ENV") !== "local" ? "include" : undefined,
  },
});
