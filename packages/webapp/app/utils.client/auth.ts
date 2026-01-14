import { createAuthClient } from "better-auth/react";
import { ClientEnvVar } from "./EnvVar";

export const AuthClient = createAuthClient({
  baseURL: ClientEnvVar.get("API_DOMAIN"),
  fetchOptions: {
    credentials: "include",
  },
});
