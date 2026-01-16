import { Hono } from "hono";
import { Route, SessionVars } from "../../utils/types";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { response } from "../../utils/util.response";

export const ValidateSlugRequestSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
});
export const ValidateSlugResponseSchema = z.object({
  isAvailable: z.boolean(),
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

    const isAvailable = await betterAuth.checkOrganizationSlug({
      body: { slug: param.slug },
    });

    return response.json(c, {
      context: "onboarding.validateSlug",
      schema: ValidateSlugResponseSchema,
      data: {
        isAvailable: isAvailable.status,
      },
    });
  }
);
