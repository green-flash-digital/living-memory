import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";

export type CompleteOnboardingResponse = {
  success: boolean;
};

export const CompleteOnboardingResponseSchema = schemaFor<CompleteOnboardingResponse>({
  success: z.boolean()
});

