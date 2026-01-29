import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";

export type GetHouseholdBySlugResponse = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  logo?: string | null;
  metadata?: any;
};

export const GetHouseholdBySlugResponseSchema = schemaFor<GetHouseholdBySlugResponse>({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
  logo: z.string().optional().nullable(),
  metadata: z.any()
});

