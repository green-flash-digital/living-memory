import { createAuthClient } from "better-auth/react";

const API_URL = typeof window !== "undefined" 
  ? (import.meta.env.VITE_API_URL || "http://localhost:8787")
  : "http://localhost:8787";

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    credentials: "include",
  },
});
