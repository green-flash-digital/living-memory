import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getEnvVar } from "../utils";

const connectionString = getEnvVar("DATABASE_URL");
export const prismaClient = new PrismaClient({
  adapter:
    getEnvVar("LIVING_MEMORY_ENV") === "local"
      ? new PrismaPg({ connectionString })
      : new PrismaNeon({ connectionString }),
});
