import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prismaClient } from "../db";
import { getEnvVar } from "./util.getEnvVar";

export const auth = betterAuth({
  database: prismaAdapter(prismaClient, {
    provider: "postgresql",
  }),
  telemetry: { enabled: false },
  secret: getEnvVar("AUTH_SECRET"),
  baseURL: getEnvVar("API_DOMAIN"),
  emailAndPassword: {
    enabled: true,
  },
  experimental: { joins: true },
  trustedOrigins: [getEnvVar("API_DOMAIN"), getEnvVar("APP_DOMAIN")],
  advanced: {
    disableOriginCheck: getEnvVar("LIVING_MEMORY_ENV") === "local",
  },
});

export type ContextVariablesAuth = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
