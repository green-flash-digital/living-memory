import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";

export type CreateHouseholdRequest = {
  name: string;
  slug: string;
};

export const CreateHouseholdRequestSchema = schemaFor<CreateHouseholdRequest>({
  name: z.string().min(1, "Household name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
});

type HouseholdMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
};

const HouseholdMemberSchema = schemaFor<HouseholdMember>({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).nullable()
});

export type CreateHouseholdResponse = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: any | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  members: HouseholdMember[];
};

export const CreateHouseholdResponseSchema = schemaFor<CreateHouseholdResponse>({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional(),
  members: HouseholdMemberSchema.array()
});
