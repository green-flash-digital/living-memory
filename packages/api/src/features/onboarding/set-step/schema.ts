import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";
import { OnboardingStep, ONBOARDING_STEP_VALUES } from "../../../db/enums.js";

type OnboardingStepType = keyof typeof OnboardingStep;

export type SetOnboardingStepRequest = {
  step: OnboardingStepType;
};

export const SetOnboardingStepRequestSchema = schemaFor<SetOnboardingStepRequest>({
  step: z.enum(ONBOARDING_STEP_VALUES)
});

export type SetOnboardingStepResponse = {
  success: boolean;
};

export const SetOnboardingStepResponseSchema = schemaFor<SetOnboardingStepResponse>({
  success: z.boolean()
});
