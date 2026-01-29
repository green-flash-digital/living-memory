import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import { response } from "../../../utils/util.response.js";
import { eq } from "drizzle-orm";
import { schema } from "../../../db/index.js";
import { SetOnboardingStepRequestSchema, SetOnboardingStepResponseSchema } from "./schema.js";

/**
 * POST `/api/onboarding/set-onboarding-step`
 *
 * Sets the user's current onboarding step.
 */
export const setStep = new Hono<Route<SessionVars>>().post(
  "",
  zValidator("json", SetOnboardingStepRequestSchema),
  async (c) => {
    const reqBody = c.req.valid("json");
    const user = c.get("user");
    const db = c.get("db");

    await db
      .update(schema.user)
      .set({
        currentOnboardingStep: reqBody.step as any,
        updatedAt: new Date()
      })
      .where(eq(schema.user.id, user.id));

    return response.json(c, {
      schema: SetOnboardingStepResponseSchema,
      data: { success: true },
      context: "onboarding.setStep"
    });
  }
);

