import { z } from "zod";

/**
 * Helper type that enforces exact matching - any extra keys become 'never'
 */
type Exact<Shape, T extends Shape> = Shape & {
  [K in Exclude<keyof T, keyof Shape>]: never;
};

/**
 * Helper to create a Zod schema that matches an interface type.
 * This ensures type safety while keeping the interface explicit in declaration files.
 *
 * The shape parameter must contain exactly the keys from T (all required keys, optional keys are optional).
 * Extra properties will cause a type error.
 *
 * @example
 * export type UserProfile = {
 *   name: string;
 *   slug: string;
 * }
 *
 * export const UserProfileSchema = schemaFor<UserProfile>({
 *   name: z.string().min(1),
 *   slug: z.string()
 * });
 */
export function schemaFor<
  T,
  S extends { [K in keyof Required<T>]: z.ZodTypeAny } = { [K in keyof Required<T>]: z.ZodTypeAny }
>(shape: Exact<{ [K in keyof Required<T>]: z.ZodTypeAny }, S>): z.ZodType<T> {
  return z.object(shape as z.ZodRawShape) as z.ZodType<T>;
}
