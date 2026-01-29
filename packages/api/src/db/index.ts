import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/postgres-js";

import "../../scripts/load-local-env-esm.ts";

import { relations } from "./relations.js";
import { schema } from "./schema/schema._.ts";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("`DATABASE_URL` environment variable is required");
}

export const db =
  process.env.LIVING_MEMORY_ENV === "local"
    ? drizzleNode(connectionString, { schema, relations })
    : drizzleNeon(connectionString, { schema, relations });

export type Database = typeof db;
export { schema };
