import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";

export type DeleteHouseholdResponse = {
  message: string;
};

export const DeleteHouseholdResponseSchema = schemaFor<DeleteHouseholdResponse>({
  message: z.string()
});

