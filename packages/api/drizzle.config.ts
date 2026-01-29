import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "node:path";

// Load env vars synchronously - drizzle-kit compiles to CommonJS
// Use process.cwd() which works reliably
const rootEnv = resolve(process.cwd(), "../../.env");
const localEnv = resolve(process.cwd(), "../.dev.vars");

config({ path: rootEnv });
config({ path: localEnv });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Make sure your .env file exists and contains DATABASE_URL.");
}

export default defineConfig({
  schema: ["./src/db/schema/schema.all.ts", "./src/db/schema/schema.auth.ts"],
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
});
