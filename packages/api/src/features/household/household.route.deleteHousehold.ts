import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { response } from "../../utils/util.response.js";
import { HTTPError } from "@living-memory/utils";

export const deleteHousehold = new Hono<Route<SessionVars>>();

export const DeleteHouseholdResponseSchema = z.object({
  message: z.string()
});
export type DeleteHouseholdResponse = z.infer<typeof DeleteHouseholdResponseSchema>;

deleteHousehold.delete(
  "/:id",
  zValidator("param", z.object({ id: z.string({ error: "Missing param ':household-id'" }) })),
  async (c) => {
    const params = c.req.valid("param");

    const user = c.get("user");
    const betterAuth = c.get("betterAuth");
    const db = c.get("db");

    // Delete the organization
    const res = await betterAuth.deleteOrganization({
      body: { organizationId: params.id },
      headers: c.req.raw.headers
    });

    if (!res) {
      throw HTTPError.serverError("There was an issue when trying to delete the household");
    }

    // Reset their onboarding status
    await db.user.update({
      data: { currentOnboardingStep: "JOIN_HOUSEHOLD", isOnboarded: false },
      where: { id: user.id }
    });

    return response.json(c, {
      context: "deleteHousehold",
      schema: DeleteHouseholdResponseSchema,
      data: { message: `Successfully deleted '${res.name}' household` }
    });
  }
);
