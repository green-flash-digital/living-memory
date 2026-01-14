-- AlterTable
ALTER TABLE "session" ADD COLUMN     "activeOrganizationId" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isOnboarded" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "household" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "metadata" TEXT,

    CONSTRAINT "household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "deviceType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_authorization" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT,
    "householdId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "qrCode" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_authorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "householdId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist_item" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "photoId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlist_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deviceCode" (
    "id" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "lastPolledAt" TIMESTAMP(3),
    "pollingInterval" INTEGER,
    "clientId" TEXT,
    "scope" TEXT,

    CONSTRAINT "deviceCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Household" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "User_Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist_share" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "sharedWithUserId" TEXT NOT NULL,
    "sharedByUserId" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'view',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlist_share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "household_slug_key" ON "household"("slug");

-- CreateIndex
CREATE INDEX "device_householdId_idx" ON "device"("householdId");

-- CreateIndex
CREATE INDEX "device_authorization_householdId_idx" ON "device_authorization"("householdId");

-- CreateIndex
CREATE INDEX "device_authorization_deviceId_idx" ON "device_authorization"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "device_authorization_code_key" ON "device_authorization"("code");

-- CreateIndex
CREATE INDEX "photo_userId_idx" ON "photo"("userId");

-- CreateIndex
CREATE INDEX "photo_householdId_idx" ON "photo"("householdId");

-- CreateIndex
CREATE INDEX "playlist_householdId_idx" ON "playlist"("householdId");

-- CreateIndex
CREATE INDEX "playlist_createdById_idx" ON "playlist"("createdById");

-- CreateIndex
CREATE INDEX "playlist_item_playlistId_idx" ON "playlist_item"("playlistId");

-- CreateIndex
CREATE INDEX "playlist_item_photoId_idx" ON "playlist_item"("photoId");

-- CreateIndex
CREATE INDEX "invitation_organizationId_idx" ON "invitation"("organizationId");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "invitation"("email");

-- CreateIndex
CREATE INDEX "User_Household_householdId_idx" ON "User_Household"("householdId");

-- CreateIndex
CREATE INDEX "User_Household_userId_idx" ON "User_Household"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_Household_userId_householdId_key" ON "User_Household"("userId", "householdId");

-- CreateIndex
CREATE INDEX "playlist_share_playlistId_idx" ON "playlist_share"("playlistId");

-- CreateIndex
CREATE INDEX "playlist_share_sharedWithUserId_idx" ON "playlist_share"("sharedWithUserId");

-- CreateIndex
CREATE INDEX "playlist_share_sharedByUserId_idx" ON "playlist_share"("sharedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_share_playlistId_sharedWithUserId_key" ON "playlist_share"("playlistId", "sharedWithUserId");

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_authorization" ADD CONSTRAINT "device_authorization_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_item" ADD CONSTRAINT "playlist_item_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_item" ADD CONSTRAINT "playlist_item_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Household" ADD CONSTRAINT "User_Household_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Household" ADD CONSTRAINT "User_Household_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_share" ADD CONSTRAINT "playlist_share_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_share" ADD CONSTRAINT "playlist_share_sharedWithUserId_fkey" FOREIGN KEY ("sharedWithUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_share" ADD CONSTRAINT "playlist_share_sharedByUserId_fkey" FOREIGN KEY ("sharedByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
