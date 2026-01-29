import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { HTTPError } from "@living-memory/utils";
import { response } from "../../../utils/util.response.js";
import { GetHouseholdBySlugResponseSchema } from "./schema.js";

export const getHousehold = new Hono<Route<SessionVars>>();

getHousehold.get(
  "/:slug",
  zValidator("param", z.object({ slug: z.string({ error: "Missing param ':household-slug'" }) })),
  async (c) => {
    const params = c.req.valid("param");
    const betterAuth = c.get("betterAuth");

    const res = await betterAuth.getFullOrganization({
      query: { organizationSlug: params.slug },
      headers: c.req.raw.headers
    });

    if (!res) {
      throw HTTPError.serverError(
        `There was an issue when trying to fetch the '${params.slug}' household.`
      );
    }

    const { members, invitations, ...household } = res;

    return response.json(c, {
      context: "household.getHouseholdBySlug",
      schema: GetHouseholdBySlugResponseSchema,
      data: household
    });
  }
);
