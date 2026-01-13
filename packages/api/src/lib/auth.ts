import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "cloudflare:workers";

import { prismaClient } from "../db";

export const auth = betterAuth({
  database: prismaAdapter(prismaClient, {
    provider: "postgresql",
  }),
  secret: getRuntimeVar("AUTH_SECRET"),
  baseURL: getRuntimeVar("API_BASE_URL"),
  emailAndPassword: {
    enabled: true,
  },
  experimental: { joins: true },
});

export type ContextVariablesAuth = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

function getRuntimeVar(key: keyof Env) {
  try {
    const envVar = env[key];
    if (typeof envVar !== "function") {
      return envVar;
    }
    return process.env[key];
  } catch {
    return undefined;
  }
}
