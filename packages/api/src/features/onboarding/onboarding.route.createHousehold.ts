import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { response } from "../../utils/util.response.js";
import { tryHandle, HTTPError } from "@living-memory/utils";

import { schemaFor } from "../../utils/schemaFor.js";

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

/**
 * POST `/api/onboarding/create-household`
 *
 * Creates a new household for the authenticated user and sets them as the owner.
 * This completes the CREATE_HOUSEHOLD onboarding step and advances the user to PAIR_DEVICE.
 */
export const createHousehold = new Hono<Route<SessionVars>>().post(
  "",
  zValidator("json", CreateHouseholdRequestSchema),
  async (c) => {
    const reqBody = c.req.valid("json");
    const user = c.get("user");
    const betterAuth = c.get("betterAuth");
    const db = c.get("db");

    // Check to see if the slug is taken
    const slugStatus = await tryHandle(
      betterAuth.checkOrganizationSlug({
        headers: c.req.raw.headers,
        body: { slug: reqBody.slug }
      })
    );
    if (!slugStatus.success) {
      throw HTTPError.badRequest(
        `The slug '${reqBody.slug}' is already taken. Please try another one.`
      );
    }

    // Create the household
    const household = await betterAuth.createOrganization({
      headers: c.req.raw.headers,
      body: {
        name: reqBody.name,
        slug: reqBody.slug,
        userId: user.id,
        keepCurrentActiveOrganization: false
      }
    });

    if (!household) {
      throw HTTPError.serverError("Failed to create household");
    }

    // Set the household as active
    await betterAuth.setActiveOrganization({
      headers: c.req.raw.headers,
      body: { organizationId: household.id }
    });

    // Update user's onboarding step
    await db.user.update({
      where: { id: user.id },
      data: {
        currentOnboardingStep: "PAIR_DEVICE"
      }
    });

    return response.json(c, {
      schema: CreateHouseholdResponseSchema,
      data: {
        ...household,
        members: household.members.filter((member) => typeof member !== "undefined")
      },
      context: "onboarding.createHousehold"
    });
  }
);
