import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema.js";

import "../../dev-utils/loadLocalEnvVars.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const db =
  process.env.LIVING_MEMORY_ENV === "local"
    ? drizzleNode(new Pool({ connectionString }), { schema })
    : drizzleNeon(neon(connectionString));

export type Database = typeof db;
export { schema };
