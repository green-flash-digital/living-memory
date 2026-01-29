import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";

export type UpdateUserInfoRequest = {
  firstName: string;
  lastName: string;
};

export const UpdateUserInfoRequestSchema = schemaFor<UpdateUserInfoRequest>({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required")
});

export type UpdateUserInfoResponse = {
  success: boolean;
  name: string;
};

export const UpdateUserInfoResponseSchema = schemaFor<UpdateUserInfoResponse>({
  success: z.boolean(),
  name: z.string()
});
