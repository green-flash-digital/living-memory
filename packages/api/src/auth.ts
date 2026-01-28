import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { deviceAuthorization } from "better-auth/plugins";

import { prismaClient } from "./db/prisma-client.js";
import { OnboardingStep } from "./db/generated/enums.js";

export const auth = betterAuth({
  database: prismaAdapter(prismaClient, {
    provider: "postgresql"
  }),
  telemetry: { enabled: false },
  trustedOrigins: [process.env.API_DOMAIN, process.env.APP_DOMAIN],
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.API_DOMAIN,
  experimental: { joins: true },
  advanced: {
    disableOriginCheck: process.env.LIVING_MEMORY_ENV === "local"
  },
  emailAndPassword: {
    enabled: true
  },
  user: {
    additionalFields: {
      isOnboarded: {
        type: "boolean",
        fieldName: "isOnboarded",
        defaultValue: false,
        input: false,
        returned: true
      },
      currentOnboardingStep: {
        type: [OnboardingStep.USER_INFO, OnboardingStep.JOIN_HOUSEHOLD, OnboardingStep.PAIR_DEVICE],
        fieldName: "currentOnboardingStep",
        defaultValue: OnboardingStep.USER_INFO,
        input: false,
        returned: true
      }
    }
  },
  plugins: [
    organization({
      schema: {
        // Map to Household model
        organization: {
          modelName: "Household",
          fields: {
            name: "name"
          }
        },
        // Map to UserHousehold join table
        member: {
          modelName: "User_Household",
          fields: {
            userId: "userId",
            organizationId: "householdId",
            role: "role"
          },
          additionalFields: {
            updatedAt: {
              type: "date"
            }
          }
        }
      }
    }),
    deviceAuthorization({
      verificationUri: `${process.env.APP_DOMAIN}/device`
    })
  ]
});
