import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";
import type { OnboardingStep } from "../../../db/enums.js";
import { ONBOARDING_STEP_VALUES } from "../../../db/enums.js";

export type OnboardingGetStatusResponse = {
  currentStep: OnboardingStep;
  isOnboarded: boolean;
  hasHousehold: boolean;
  householdId: string | null;
  householdName: string | null;
  hasPairedDevice: boolean;
};

export const OnboardingGetStatusResponseSchema = schemaFor<OnboardingGetStatusResponse>({
  currentStep: z.enum(ONBOARDING_STEP_VALUES),
  isOnboarded: z.boolean(),
  hasHousehold: z.boolean(),
  householdId: z.string().nullable(),
  householdName: z.string().nullable(),
  hasPairedDevice: z.boolean()
});
