import { createAuthClient } from "better-auth/react";
import { EnvVar } from "./EnvVar";

export const AuthClient = createAuthClient({
  baseURL: EnvVar.get("API_DOMAIN"),
  fetchOptions: {
    credentials: "include",
  },
});
