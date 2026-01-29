import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";

export type JoinHouseholdRequest = {
  invitationCode: string;
};

// Keep the historical export name to avoid churn.
export const joinHouseholdSchema = schemaFor<JoinHouseholdRequest>({
  invitationCode: z.string().min(1, "Invitation code is required")
});
