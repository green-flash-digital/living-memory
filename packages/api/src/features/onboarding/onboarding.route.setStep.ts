import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import { response } from "../../utils/util.response.js";
import { schemaFor } from "../../utils/schemaFor.js";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db/index.js";
import z from "zod";
import { OnboardingStep } from "../../db/enums.js";

type OnboardingStepType = keyof typeof OnboardingStep;

export type SetOnboardingStepRequest = {
  step: OnboardingStepType;
};
export const SetOnboardingStepRequestSchema = schemaFor<SetOnboardingStepRequest>({
  step: z.enum([
    OnboardingStep.USER_INFO,
    OnboardingStep.PICK_HOUSEHOLD_OPTION,
    OnboardingStep.JOIN_HOUSEHOLD,
    OnboardingStep.CREATE_HOUSEHOLD,
    OnboardingStep.PAIR_DEVICE
  ])
});

export type SetOnboardingStepResponse = {
  success: boolean;
};
export const SetOnboardingStepResponseSchema = schemaFor<SetOnboardingStepResponse>({
  success: z.boolean()
});

/**
 * POST `/api/onboarding/set-onboarding-step`
 *
 * Sets the user's current onboarding step.
 * Accepts any valid OnboardingStep value from the Prisma schema.
 */
export const setStep = new Hono<Route<SessionVars>>().post(
  "",
  zValidator("json", SetOnboardingStepRequestSchema),
  async (c) => {
    const reqBody = c.req.valid("json");
    const user = c.get("user");
    const db = c.get("db");

    // Update user's onboarding step with the provided step
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
