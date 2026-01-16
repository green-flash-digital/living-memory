import type { Context } from "hono";
import z from "zod";
import { HTTPError } from "./ApiError";
import { colors } from "./util.colors";

/**
 * Validates response data against a schema and returns a JSON response.
 * Throws a ValidationError if validation fails.
 *
 * Optionally logs context for debugging when validation fails.
 *
 * @example
 * ```typescript
 * return response.json(c, {
 *   schema: ValidateSlugResponseSchema,
 *   data: { isAvailable: true },
 *   context: "onboarding.validateSlug"
 * });
 * ```
 */
export function jsonResponse<C extends Context, S extends z.ZodType>(
  c: C,
  { schema, data, context }: { schema: S; data: z.output<S>; context: string }
) {
  const res = schema.safeParse(data);
  if (!res.success) {
    const errorMsg = colors.red(colors.bold("🚨 Response validation failed"));
    const routeMsg = colors.cyan(`"${context}"`);
    console.error(`\n${errorMsg} in route ${routeMsg}\n`);
    throw HTTPError.validation(res.error, "Response validation failed");
  }
  return c.json(res.data);
}

export const response = {
  json: jsonResponse,
};
