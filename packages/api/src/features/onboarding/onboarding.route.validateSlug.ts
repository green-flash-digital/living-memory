import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { schemaFor } from "../../utils/schemaFor.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { response } from "../../utils/util.response.js";
import { HTTPError, tryHandle } from "@living-memory/utils";

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

/**
 * GET `/api/onboarding/validate-slug/:slug`
 *
 * Checks if a given household slug is available (not already taken).
 * Expects a valid slug as a URL parameter and responds with an availability boolean.
 */
export const validateSlug = new Hono<Route<SessionVars>>().get(
  ":slug",
  zValidator("param", ValidateSlugRequestSchema),
  async (c) => {
    const param = c.req.valid("param");
    const betterAuth = c.get("betterAuth");

    const slugRes = await tryHandle(
      betterAuth.checkOrganizationSlug({
        body: { slug: param.slug }
      })
    );
    if (!slugRes.success) {
      throw HTTPError.badRequest(`The slug '${param.slug}' is already taken`);
    }

    return response.json(c, {
      context: "onboarding.validateSlug",
      schema: ValidateSlugResponseSchema,
      data: { isAvailable: true }
    });
  }
);
