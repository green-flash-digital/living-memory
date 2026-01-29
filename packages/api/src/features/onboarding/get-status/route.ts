import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { OnboardingStep } from "../../../db/enums.js";
import { eq, and, count } from "drizzle-orm";
import { schema } from "../../../db/index.js";
import { response } from "../../../utils/util.response.js";
import { OnboardingGetStatusResponseSchema } from "./schema.js";

/**
 * GET `/api/onboarding/status`
 *
 * Retrieves the current onboarding status for the authenticated user, including
 * their current step, household information, and device pairing status.
 */
export const getStatus = new Hono<Route<SessionVars>>().get("", async (c) => {
  const user = c.get("user");
  const session = c.get("session");
  const db = c.get("db");

  // Get user household relationship
  const userHouseholds = session.activeOrganizationId
    ? await db
        .select({
          household: schema.household
        })
        .from(schema.userHousehold)
        .innerJoin(schema.household, eq(schema.userHousehold.householdId, schema.household.id))
        .where(
          and(
            eq(schema.userHousehold.userId, user.id),
            eq(schema.userHousehold.householdId, session.activeOrganizationId)
          )
        )
        .limit(1)
    : [];

  const household = userHouseholds[0]?.household || null;
  const hasHousehold = !!household;

  // Check if user has paired devices
  const deviceCount = hasHousehold
    ? await db
        .select({ count: count() })
        .from(schema.device)
        .where(and(eq(schema.device.householdId, household!.id), eq(schema.device.isActive, true)))
    : [{ count: 0 }];

  const hasPairedDevice = (deviceCount[0]?.count || 0) > 0;

  return response.json(c, {
    schema: OnboardingGetStatusResponseSchema,
    data: {
      currentStep: user.currentOnboardingStep || OnboardingStep.USER_INFO,
      isOnboarded: user.isOnboarded || false,
      hasHousehold,
      householdId: household?.id || null,
      householdName: household?.name || null,
      hasPairedDevice
    },
    context: "onboarding.getStatus"
  });
});

