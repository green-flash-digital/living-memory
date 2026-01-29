CREATE TYPE "public"."OnboardingStep" AS ENUM('USER_INFO', 'PICK_HOUSEHOLD_OPTION', 'JOIN_HOUSEHOLD', 'CREATE_HOUSEHOLD', 'PAIR_DEVICE');--> statement-breakpoint
CREATE TABLE "device" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"householdId" text NOT NULL,
	"deviceType" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"lastSeenAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_authorization" (
	"id" text PRIMARY KEY NOT NULL,
	"deviceId" text,
	"householdId" text NOT NULL,
	"code" text NOT NULL,
	"qrCode" text,
	"expiresAt" timestamp NOT NULL,
	"isUsed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "device_authorization_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "photo" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"householdId" text NOT NULL,
	"url" text NOT NULL,
	"filename" text,
	"mimeType" text,
	"size" integer,
	"width" integer,
	"height" integer,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlist" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"householdId" text NOT NULL,
	"createdById" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isPublic" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlist_item" (
	"id" text PRIMARY KEY NOT NULL,
	"playlistId" text NOT NULL,
	"photoId" text,
	"order" integer DEFAULT 0 NOT NULL,
	"duration" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlist_share" (
	"id" text PRIMARY KEY NOT NULL,
	"playlistId" text NOT NULL,
	"sharedWithUserId" text NOT NULL,
	"sharedByUserId" text NOT NULL,
	"permission" text DEFAULT 'view' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_code" (
	"id" text PRIMARY KEY NOT NULL,
	"device_code" text NOT NULL,
	"user_code" text NOT NULL,
	"user_id" text,
	"expires_at" timestamp NOT NULL,
	"status" text NOT NULL,
	"last_polled_at" timestamp,
	"polling_interval" integer,
	"client_id" text,
	"scope" text
);
--> statement-breakpoint
CREATE TABLE "household" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "household_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_onboarded" boolean DEFAULT false,
	"current_onboarding_step" text DEFAULT 'USER_INFO',
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_household" (
	"id" text PRIMARY KEY NOT NULL,
	"household_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "device" ADD CONSTRAINT "device_householdId_household_id_fk" FOREIGN KEY ("householdId") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_authorization" ADD CONSTRAINT "device_authorization_deviceId_device_id_fk" FOREIGN KEY ("deviceId") REFERENCES "public"."device"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_householdId_household_id_fk" FOREIGN KEY ("householdId") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_householdId_household_id_fk" FOREIGN KEY ("householdId") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_createdById_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_item" ADD CONSTRAINT "playlist_item_playlistId_playlist_id_fk" FOREIGN KEY ("playlistId") REFERENCES "public"."playlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_item" ADD CONSTRAINT "playlist_item_photoId_photo_id_fk" FOREIGN KEY ("photoId") REFERENCES "public"."photo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_share" ADD CONSTRAINT "playlist_share_playlistId_playlist_id_fk" FOREIGN KEY ("playlistId") REFERENCES "public"."playlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_share" ADD CONSTRAINT "playlist_share_sharedWithUserId_user_id_fk" FOREIGN KEY ("sharedWithUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_share" ADD CONSTRAINT "playlist_share_sharedByUserId_user_id_fk" FOREIGN KEY ("sharedByUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_household_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_household" ADD CONSTRAINT "user_household_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_household" ADD CONSTRAINT "user_household_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "device_householdId_idx" ON "device" USING btree ("householdId");--> statement-breakpoint
CREATE UNIQUE INDEX "device_authorization_code_key" ON "device_authorization" USING btree ("code");--> statement-breakpoint
CREATE INDEX "device_authorization_householdId_idx" ON "device_authorization" USING btree ("householdId");--> statement-breakpoint
CREATE INDEX "device_authorization_deviceId_idx" ON "device_authorization" USING btree ("deviceId");--> statement-breakpoint
CREATE INDEX "photo_userId_idx" ON "photo" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "photo_householdId_idx" ON "photo" USING btree ("householdId");--> statement-breakpoint
CREATE INDEX "playlist_householdId_idx" ON "playlist" USING btree ("householdId");--> statement-breakpoint
CREATE INDEX "playlist_createdById_idx" ON "playlist" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "playlist_item_playlistId_idx" ON "playlist_item" USING btree ("playlistId");--> statement-breakpoint
CREATE INDEX "playlist_item_photoId_idx" ON "playlist_item" USING btree ("photoId");--> statement-breakpoint
CREATE UNIQUE INDEX "playlist_share_playlistId_sharedWithUserId_key" ON "playlist_share" USING btree ("playlistId","sharedWithUserId");--> statement-breakpoint
CREATE INDEX "playlist_share_playlistId_idx" ON "playlist_share" USING btree ("playlistId");--> statement-breakpoint
CREATE INDEX "playlist_share_sharedWithUserId_idx" ON "playlist_share" USING btree ("sharedWithUserId");--> statement-breakpoint
CREATE INDEX "playlist_share_sharedByUserId_idx" ON "playlist_share" USING btree ("sharedByUserId");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "household_slug_uidx" ON "household" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_household_householdId_idx" ON "user_household" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "user_household_userId_idx" ON "user_household" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");