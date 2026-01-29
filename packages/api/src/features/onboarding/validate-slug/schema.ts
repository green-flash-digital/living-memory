import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";

export type ValidateSlugRequest = {
  slug: string;
};

export const ValidateSlugRequestSchema = schemaFor<ValidateSlugRequest>({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
});

export type ValidateSlugResponse = {
  isAvailable: boolean;
};

export const ValidateSlugResponseSchema = schemaFor<ValidateSlugResponse>({
  isAvailable: z.boolean()
});
