import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prismaClient } from "../db";

export const auth = betterAuth({
  database: prismaAdapter(prismaClient, {
    provider: "postgresql",
  }),
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.API_BASE_URL,
  emailAndPassword: {
    enabled: true,
  },
  experimental: { joins: true },
});

export type ContextVariablesAuth = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
