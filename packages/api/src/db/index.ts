import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/client";
import { env } from "cloudflare:workers";

const adapter = new PrismaNeon({
  connectionString: env.DATABASE_URL,
});
export const prismaClient = new PrismaClient({ adapter });
