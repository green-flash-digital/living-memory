import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { eq } from "drizzle-orm";
import { schema } from "../../../db/index.js";
import { response } from "../../../utils/util.response.js";
import { CompleteOnboardingResponseSchema } from "./schema.js";

/**
 * POST `/api/onboarding/complete`
 *
 * Marks the authenticated user as onboarded.
 */
export const completeOnboarding = new Hono<Route<SessionVars>>().post("", async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  await db
    .update(schema.user)
    .set({
      isOnboarded: true,
      currentOnboardingStep: "COMPLETE",
      updatedAt: new Date()
    })
    .where(eq(schema.user.id, user.id));

  return response.json(c, {
    schema: CompleteOnboardingResponseSchema,
    data: { success: true },
    context: "onboarding.complete"
  });
});

