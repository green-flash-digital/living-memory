import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import { response } from "../../utils/util.response.js";
import { schemaFor } from "../../utils/schemaFor.js";
import z from "zod";

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

/**
 * POST `/api/onboarding/update-user-info`
 *
 * Updates the user's name (combining first and last name) and advances
 * the onboarding step to PICK_HOUSEHOLD_OPTION.
 */
export const updateUserInfo = new Hono<Route<SessionVars>>().post(
  "",
  zValidator("json", UpdateUserInfoRequestSchema),
  async (c) => {
    const reqBody = c.req.valid("json");
    const user = c.get("user");
    const db = c.get("db");

    // Combine first and last name
    const fullName = `${reqBody.firstName} ${reqBody.lastName}`.trim();

    // Update user's name and onboarding step
    await db.user.update({
      where: { id: user.id },
      data: {
        name: fullName,
        currentOnboardingStep: "PICK_HOUSEHOLD_OPTION"
      }
    });

    return response.json(c, {
      schema: UpdateUserInfoResponseSchema,
      data: {
        success: true,
        name: fullName
      },
      context: "onboarding.updateUserInfo"
    });
  }
);
