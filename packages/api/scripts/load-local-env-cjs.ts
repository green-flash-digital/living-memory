const { config } = require("dotenv");
const { resolve } = require("node:path");

/**
 * Load env vars synchronously (CommonJS-friendly).
 * Uses process.cwd() which works reliably in drizzle-kit + scripts.
 */
export function loadLocalEnv() {
  const rootEnv = resolve(process.cwd(), "../../.env");
  const localEnv = resolve(process.cwd(), "../.dev.vars");

  config({ path: rootEnv });
  config({ path: localEnv });
}
