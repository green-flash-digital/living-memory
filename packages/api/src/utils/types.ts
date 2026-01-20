import type { auth } from "../auth.js";
import { prismaClient } from "../db/prisma-client.js";
import { z } from "zod";

/**
 * Utility type to force TypeScript to expand z.infer types in IntelliSense.
 * This helps with type expansion in declaration files and hover tooltips.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Helper to create a Zod schema that matches an interface type.
 * This ensures type safety while keeping the interface explicit in declaration files.
 *
 * @example
 * export interface CreateHouseholdRequest {
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

export type LMEnvs = Cloudflare.Env;
export type LMBindings = LMEnvs;

export type SessionVars = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
  betterAuth: typeof auth.api;
  db: typeof prismaClient;
};

export type MaybeSessionVars = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
  betterAuth: typeof auth.api | null;
  db: typeof prismaClient | null;
};

export type Route<V extends Record<string, unknown> | undefined = undefined> = V extends undefined
  ? { Bindings: LMBindings }
  : {
      Bindings: LMBindings;
      Variables: V;
    };

export type Middleware<V extends Record<string, unknown>> = {
  Bindings: LMBindings;
  Variables: V;
};
