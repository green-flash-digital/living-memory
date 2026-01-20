import { schemaFor } from "../../utils/schemaFor.js";
import z from "zod";

// Request/Response types and schemas for onboarding routes
// These are separated from route files to avoid pulling in database dependencies

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
  updatedAt: z.string().or(z.date()).optional()
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

export type OnboardingGetStatusResponse = {
  currentStep: "USER_INFO" | "JOIN_HOUSEHOLD" | "PAIR_DEVICE";
  isOnboarded: boolean;
  hasHousehold: boolean;
  householdId: string | null;
  householdName: string | null;
  hasPairedDevice: boolean;
};

export const OnboardingGetStatusResponseSchema = schemaFor<OnboardingGetStatusResponse>({
  currentStep: z.enum(["USER_INFO", "JOIN_HOUSEHOLD", "PAIR_DEVICE"]),
  isOnboarded: z.boolean(),
  hasHousehold: z.boolean(),
  householdId: z.string().nullable(),
  householdName: z.string().nullable(),
  hasPairedDevice: z.boolean()
});

export type JoinHouseholdRequest = {
  invitationCode: string;
};

export const joinHouseholdSchema = schemaFor<JoinHouseholdRequest>({
  invitationCode: z.string().min(1, "Invitation code is required")
});
