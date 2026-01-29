import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";
import { OnboardingStep } from "../../../db/enums.js";

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
