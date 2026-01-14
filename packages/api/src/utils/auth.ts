import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { deviceAuthorization } from "better-auth/plugins";

import { prismaClient } from "../db/prisma-client";
import { getEnvVar } from "./util.getEnvVar";

export const auth = betterAuth({
  database: prismaAdapter(prismaClient, {
    provider: "postgresql",
    debugLogs: true,
  }),
  telemetry: { enabled: false },
  trustedOrigins: [getEnvVar("API_DOMAIN"), getEnvVar("APP_DOMAIN")],
  secret: getEnvVar("AUTH_SECRET"),
  baseURL: getEnvVar("API_DOMAIN"),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      isOnboarded: {
        type: "boolean",
        fieldName: "isOnboarded",
        defaultValue: false,
        input: false,
        returned: true,
      },
    },
  },
  plugins: [
    organization({
      schema: {
        // Map to Household model
        organization: {
          modelName: "Household",
          fields: {
            name: "name",
          },
        },
        // Map to UserHousehold join table
        member: {
          modelName: "User_Household",
          fields: {
            userId: "userId",
            organizationId: "householdId",
            role: "role",
          },
          additionalFields: {
            updatedAt: {
              type: "date",
            },
          },
        },
      },
    }),
    deviceAuthorization({
      verificationUri: "/device",
    }),
  ],
  experimental: { joins: true },
  advanced: {
    disableOriginCheck: getEnvVar("LIVING_MEMORY_ENV") === "local",
  },
});

export type ContextVariablesAuth = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
