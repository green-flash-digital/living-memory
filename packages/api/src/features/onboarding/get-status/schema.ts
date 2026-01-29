import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";
import { OnboardingStep } from "../../../db/enums.js";

export type OnboardingGetStatusResponse = {
  currentStep: OnboardingStep;
  isOnboarded: boolean;
  hasHousehold: boolean;
  householdId: string | null;
  householdName: string | null;
  hasPairedDevice: boolean;
};

export const OnboardingGetStatusResponseSchema = schemaFor<OnboardingGetStatusResponse>({
  currentStep: z.enum([
    "USER_INFO",
    "PICK_HOUSEHOLD_OPTION",
    "JOIN_HOUSEHOLD",
    "CREATE_HOUSEHOLD",
    "PAIR_DEVICE"
  ]),
  isOnboarded: z.boolean(),
  hasHousehold: z.boolean(),
  householdId: z.string().nullable(),
  householdName: z.string().nullable(),
  hasPairedDevice: z.boolean()
});
