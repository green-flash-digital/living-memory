import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

export const prismaClient = new PrismaClient({
  adapter:
    process.env.LIVING_MEMORY_ENV === "local"
      ? new PrismaPg({ connectionString, maxUses: 1 })
      : new PrismaNeon({ connectionString }),
});
