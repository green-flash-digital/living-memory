import { defineConfig } from "drizzle-kit";
import { loadLocalEnv } from "./scripts/load-local-env-cjs.js";

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
  }
});
