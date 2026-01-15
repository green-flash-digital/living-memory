-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('USER_INFO', 'JOIN_HOUSEHOLD', 'PAIR_DEVICE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "currentOnboardingStep" "OnboardingStep" NOT NULL DEFAULT 'USER_INFO';
