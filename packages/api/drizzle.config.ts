import { defineConfig } from "drizzle-kit";
import { loadLocalEnv } from "./scripts/load-local-env-cjs.ts";

loadLocalEnv();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Make sure your .env file exists and contains DATABASE_URL."
  );
}

export default defineConfig({
  schema: ["./src/db/schema/schema.all.ts", "./src/db/schema/schema.auth.ts"],
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL
  },
  // By default drizzle-kit uses a separate "drizzle" schema for its migration log table
  // and will run: CREATE SCHEMA IF NOT EXISTS "drizzle"
  // If your DB user can't create schemas, keep this in "public".
  migrations: {
    schema: "public"
    // table: "__drizzle_migrations", // default; uncomment if you want it explicit
  }
});
