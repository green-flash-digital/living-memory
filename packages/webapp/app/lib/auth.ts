import { createAuthClient } from "better-auth/react";
import { EnvVar } from "./EnvVar";

export const authClient = createAuthClient({
  baseURL: EnvVar.get("API_DOMAIN"),
  fetchOptions: {
    credentials: "include",
  },
});
