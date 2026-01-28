import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import { response } from "../../utils/util.response.js";
import { schemaFor } from "../../utils/schemaFor.js";
import z from "zod";
import {
  type OnboardingStep as OnboardingStepType,
  OnboardingStep
} from "../../db/generated/browser.js";

export type SetOnboardingStepRequest = {
  step: OnboardingStepType;
};
export const SetOnboardingStepRequestSchema = schemaFor<SetOnboardingStepRequest>({
  step: z.enum(OnboardingStep)
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
    await db.user.update({
      where: { id: user.id },
      data: {
        currentOnboardingStep: reqBody.step
      }
    });

    return response.json(c, {
      schema: SetOnboardingStepResponseSchema,
      data: { success: true },
      context: "onboarding.setStep"
    });
  }
);
