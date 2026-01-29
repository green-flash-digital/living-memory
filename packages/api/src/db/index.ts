import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/postgres-js";

import { relations } from "./relations.js";
import { schema } from "./schema/index.js";

type DbFactoryResult = {
  db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzleNode>;
  /**
   * Optional cleanup for drivers that hold sockets (e.g. postgres-js).
   * Safe to call even if undefined.
   */
  close?: () => Promise<void>;
};

export function createDb(connectionString: string = process.env.DATABASE_URL as string): DbFactoryResult {
  if (!connectionString) {
    throw new Error("`DATABASE_URL` environment variable is required");
  }

  // Local dev uses postgres-js (TCP). In Cloudflare Workers this MUST be per-request.
  if (process.env.LIVING_MEMORY_ENV === "local") {
    const db = drizzleNode(connectionString, { schema, relations });
    return { db };
  }

  // Production (Workers) uses HTTP-based Neon driver (fetch-based, safe to reuse).
  const db = drizzleNeon(connectionString, { schema, relations });
  return { db };
}

export type Database = ReturnType<typeof createDb>["db"];
export { schema };
