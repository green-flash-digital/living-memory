import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import { OnboardingStep } from "../../db/generated/enums.js";
import z from "zod";

/**
 * Schema for joining a household via invitation
 */
export const joinHouseholdSchema = z.object({
  invitationCode: z.string().min(1, "Invitation code is required"),
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

    // Find invitation by code (assuming invitation code is stored somewhere)
    // For now, we'll search by email or a code field
    // You may need to adjust this based on your invitation model
    const invitation = await db.invitation.findFirst({
      where: {
        email: user.email,
        status: "pending",
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        household: true,
      },
    });

    if (!invitation) {
      return c.json({ error: "Invalid or expired invitation" }, 400);
    }

    // Check if user is already a member
    const existingMembership = await db.user_Household.findUnique({
      where: {
        userId_householdId: {
          userId: user.id,
          householdId: invitation.organizationId,
        },
      },
    });

    if (existingMembership) {
      return c.json({ error: "User is already a member" }, 400);
    }

    // Create user-household relationship
    await db.user_Household.create({
      data: {
        userId: user.id,
        householdId: invitation.organizationId,
        role: invitation.role || "member",
      },
    });

    // Update invitation status
    await db.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    });

    // Update user's onboarding step
    await db.user.update({
      where: { id: user.id },
      data: {
        currentOnboardingStep: OnboardingStep.PAIR_DEVICE,
      },
    });

    return c.json({
      householdId: invitation.household.id,
      householdName: invitation.household.name,
      message: "Successfully joined household",
    });
  }
);
