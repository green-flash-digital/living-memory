import { Context } from "hono";
import z, { ZodSchema } from "zod";
import { HTTPError } from "./ApiError";

/**
 * Validates response data against a schema and returns a JSON response.
 * Throws a ValidationError if validation fails, including optional context.
 *
 * @example
 * ```typescript
 * return response.json(c, {
 *   schema: ValidateSlugResponseSchema,
 *   data: { isAvailable: true },
 *   context: "validate-slug"
 * });
 * ```
 */
export function jsonResponse<C extends Context, S extends ZodSchema>(
  c: C,
  { schema, data, context }: { schema: S; data: z.output<S>; context?: string }
) {
  const res = schema.safeParse(data);
  if (!res.success) {
    const message = `Response validation failed${context ? ` in '${context}'` : ""}`;
    throw HTTPError.validation(res.error, message);
  }
  return c.json(res.data);
}

export const response = {
  json: jsonResponse,
};
