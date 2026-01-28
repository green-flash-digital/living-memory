import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { deviceAuthorization } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";
import { db, schema } from "./db/db.js";
import { OnboardingStep } from "./db/enums.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification
    }
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
        type: Object.values(OnboardingStep),
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
          modelName: "household",
          fields: {
            name: "name"
          }
        },
        // Map to UserHousehold join table
        member: {
          modelName: "user_household",
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
    bearer(),
    deviceAuthorization({
      verificationUri: `${process.env.APP_DOMAIN}/pair-device`
    })
  ]
});
