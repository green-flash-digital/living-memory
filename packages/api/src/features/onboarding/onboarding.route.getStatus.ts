import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { schemaFor } from "../../utils/schemaFor.js";
import { OnboardingStep } from "../../db/generated/enums.js";
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

  // Get user with household relationship
  const userWithHousehold = await db.user.findUnique({
    where: { id: user.id },
    include: {
      user_households: {
        where: {
          householdId: session.activeOrganizationId || undefined
        },
        include: {
          household: true
        }
      }
    }
  });

  const household = userWithHousehold?.user_households[0]?.household;
  const hasHousehold = !!household;

  // Check if user has paired devices
  const hasPairedDevice = hasHousehold
    ? (await db.device.count({
        where: {
          householdId: household.id,
          isActive: true
        }
      })) > 0
    : false;

  return c.json({
    currentStep: user.currentOnboardingStep || OnboardingStep.USER_INFO,
    isOnboarded: user.isOnboarded || false,
    hasHousehold,
    householdId: household?.id || null,
    householdName: household?.name || null,
    hasPairedDevice
  });
});
