import { z } from "zod";

/**
 * Helper to create a Zod schema that matches an interface type.
 * This ensures type safety while keeping the interface explicit in declaration files.
 *
 * @example
 * export type CreateHouseholdRequest = {
 *   name: string;
 *   slug: string;
 * }
 *
 * export const CreateHouseholdRequestSchema = schemaFor<CreateHouseholdRequest>({
 *   name: z.string().min(1),
 *   slug: z.string()
 * });
 */
export function schemaFor<T>(shape: z.ZodRawShape): z.ZodType<T> {
  return z.object(shape) as z.ZodType<T>;
}
