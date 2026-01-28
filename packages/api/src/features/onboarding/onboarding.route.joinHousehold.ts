import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { schemaFor } from "../../utils/schemaFor.js";
import { zValidator } from "@hono/zod-validator";
import { OnboardingStep } from "../../db/enums.js";
import { eq, and, gt } from "drizzle-orm";
import { db, schema } from "../../db/db.js";
import z from "zod";

/**
 * Schema for joining a household via invitation
 */
export type JoinHouseholdRequest = {
  invitationCode: string;
};

export const joinHouseholdSchema = schemaFor<JoinHouseholdRequest>({
  invitationCode: z.string().min(1, "Invitation code is required")
});

export const joinHousehold = new Hono<Route<SessionVars>>().post(
  "",
  zValidator("json", joinHouseholdSchema),
  async (c) => {
    const user = c.get("user");
    const session = c.get("session");
    const { invitationCode } = c.req.valid("json");
    const db = c.get("db");

    // Check if user already has a household
    if (session.activeOrganizationId) {
      return c.json({ error: "User already has a household" }, 400);
    }

    // Find invitation by email
    const [invitation] = await db
      .select()
      .from(schema.invitation)
      .where(
        and(
          eq(schema.invitation.email, user.email),
          eq(schema.invitation.status, "pending"),
          gt(schema.invitation.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!invitation) {
      return c.json({ error: "Invalid or expired invitation" }, 400);
    }

    // Get household
    const [household] = await db
      .select()
      .from(schema.household)
      .where(eq(schema.household.id, invitation.organizationId))
      .limit(1);

    if (!household) {
      return c.json({ error: "Household not found" }, 400);
    }

    // Check if user is already a member
    const [existingMembership] = await db
      .select()
      .from(schema.userHousehold)
      .where(
        and(
          eq(schema.userHousehold.userId, user.id),
          eq(schema.userHousehold.householdId, invitation.organizationId)
        )
      )
      .limit(1);

    if (existingMembership) {
      return c.json({ error: "User is already a member" }, 400);
    }

    // Create user-household relationship
    await db.insert(schema.userHousehold).values({
      userId: user.id,
      householdId: invitation.organizationId,
      role: invitation.role || "member"
    });

    // Update invitation status
    await db
      .update(schema.invitation)
      .set({ status: "accepted" })
      .where(eq(schema.invitation.id, invitation.id));

    // Update user's onboarding step
    await db
      .update(schema.user)
      .set({
        currentOnboardingStep: OnboardingStep.PAIR_DEVICE,
        updatedAt: new Date()
      })
      .where(eq(schema.user.id, user.id));

    return c.json({
      householdId: household.id,
      householdName: household.name,
      message: "Successfully joined household"
    });
  }
);
