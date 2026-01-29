import "../../dev-utils/loadLocalEnvVars.js";
import { seedSuperUser } from "./seed.super-user.js";
import { db } from "../../src/db/index.js";

const seedScripts = [seedSuperUser];

async function closeDbConnections() {
  // Locally we use `drizzle-orm/postgres-js`, which keeps an open pool/socket by default.
  // Drizzle exposes the underlying client as `db.$client` (runtime), but it may not be typed.
  const client = (db as any)?.$client;
  if (!client) return;

  if (typeof client.end === "function") {
    await client.end({ timeout: 5 });
    return;
  }

  if (typeof client.close === "function") {
    await client.close();
  }
}

try {
  for (const seedScript of seedScripts) {
    await seedScript();
  }
} catch (error) {
  throw new Error(String(error));
} finally {
  await closeDbConnections();
}
