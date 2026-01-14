// NOTE: This file is intended to be used only at build time or during CLI operations where a full Node.js environment is available.
// This allows us to run commands such as database migrations and Prisma client generation, which require Node.js.
// This file is NOT used at application/runtime (e.g., in Cloudflare Workers or other serverless environments), so it is safe to use Node.js-specific features here.

import "./dev-utils/loadLocalEnvVars";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/index.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
