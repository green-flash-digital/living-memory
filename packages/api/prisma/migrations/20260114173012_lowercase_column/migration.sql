/*
  Warnings:

  - You are about to drop the `User_Household` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User_Household" DROP CONSTRAINT "User_Household_householdId_fkey";

-- DropForeignKey
ALTER TABLE "User_Household" DROP CONSTRAINT "User_Household_userId_fkey";

-- DropTable
DROP TABLE "User_Household";

-- CreateTable
CREATE TABLE "user_household" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_household_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_household_householdId_idx" ON "user_household"("householdId");

-- CreateIndex
CREATE INDEX "user_household_userId_idx" ON "user_household"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_household_userId_householdId_key" ON "user_household"("userId", "householdId");

-- AddForeignKey
ALTER TABLE "user_household" ADD CONSTRAINT "user_household_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_household" ADD CONSTRAINT "user_household_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
