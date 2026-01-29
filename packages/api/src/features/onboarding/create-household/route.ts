import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import { response } from "../../../utils/util.response.js";
import { tryHandle, HTTPError } from "@living-memory/utils";
import { eq } from "drizzle-orm";
import { schema } from "../../../db/index.js";
import { CreateHouseholdRequestSchema, CreateHouseholdResponseSchema } from "./schema.js";

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
      throw HTTPError.badRequest(`The slug '${reqBody.slug}' is already taken. Please try another one.`);
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
    await db
      .update(schema.user)
      .set({
        currentOnboardingStep: "PAIR_DEVICE",
        updatedAt: new Date()
      })
      .where(eq(schema.user.id, user.id));

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

