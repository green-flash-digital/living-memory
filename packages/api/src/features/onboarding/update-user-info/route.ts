import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import { response } from "../../../utils/util.response.js";
import { eq } from "drizzle-orm";
import { schema } from "../../../db/index.js";
import { UpdateUserInfoRequestSchema, UpdateUserInfoResponseSchema } from "./schema.js";

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

    const fullName = `${reqBody.firstName} ${reqBody.lastName}`.trim();

    await db
      .update(schema.user)
      .set({
        name: fullName,
        currentOnboardingStep: "PICK_HOUSEHOLD_OPTION",
        updatedAt: new Date()
      })
      .where(eq(schema.user.id, user.id));

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

