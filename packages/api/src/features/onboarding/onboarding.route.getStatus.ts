import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { schemaFor } from "../../utils/schemaFor.js";
import { OnboardingStep } from "../../db/enums.js";
import { eq, and, count } from "drizzle-orm";
import { db, schema } from "../../db/index.js";
import z from "zod";

/**
 * Response schema for onboarding status
 */
export type OnboardingGetStatusResponse = {
  currentStep: "USER_INFO" | "JOIN_HOUSEHOLD" | "PAIR_DEVICE";
  isOnboarded: boolean;
  hasHousehold: boolean;
  householdId: string | null;
  householdName: string | null;
  hasPairedDevice: boolean;
};

export const OnboardingGetStatusResponseSchema = schemaFor<OnboardingGetStatusResponse>({
  currentStep: z.enum(["USER_INFO", "JOIN_HOUSEHOLD", "PAIR_DEVICE"]),
  isOnboarded: z.boolean(),
  hasHousehold: z.boolean(),
  householdId: z.string().nullable(),
  householdName: z.string().nullable(),
  hasPairedDevice: z.boolean()
});

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

  return c.json({
    currentStep: user.currentOnboardingStep || OnboardingStep.USER_INFO,
    isOnboarded: user.isOnboarded || false,
    hasHousehold,
    householdId: household?.id || null,
    householdName: household?.name || null,
    hasPairedDevice
  });
});
