import { Hono } from "hono";
import { Route, SessionVars } from "../../utils/types";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { OnboardingStep } from "../../db/generated/enums";

export const CreateHouseholdRequestSchema = z.object({
  name: z.string().min(1, "Household name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
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
    const isOrgSlugTaken = await betterAuth.checkOrganizationSlug({
      headers: c.req.raw.headers,
      body: { slug: reqBody.slug },
    });
    if (!isOrgSlugTaken.status) {
      throw new Error("The slug is already taken");
    }

    // Create the household
    const household = await betterAuth.createOrganization({
      headers: c.req.raw.headers,
      body: {
        name: reqBody.name,
        slug: reqBody.slug,
        userId: user.id,
        keepCurrentActiveOrganization: false,
      },
    });

    // Update user's onboarding step
    await db.user.update({
      where: { id: user.id },
      data: {
        currentOnboardingStep: OnboardingStep.PAIR_DEVICE,
      },
    });

    return c.json(household);
  }
);
