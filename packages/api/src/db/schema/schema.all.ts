import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  pgEnum,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { household, user } from "./schema.auth.ts";

// Enums
export const onboardingStepEnum = pgEnum("OnboardingStep", [
  "USER_INFO",
  "PICK_HOUSEHOLD_OPTION",
  "JOIN_HOUSEHOLD",
  "CREATE_HOUSEHOLD",
  "PAIR_DEVICE"
]);

// Application tables
export const device = pgTable(
  "device",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    householdId: text("householdId")
      .notNull()
      .references(() => household.id, { onDelete: "cascade" }),
    deviceType: text("deviceType"),
    isActive: boolean("isActive").notNull().default(true),
    lastSeenAt: timestamp("lastSeenAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow()
  },
  (table) => [index("device_householdId_idx").on(table.householdId)]
);

export const deviceAuthorization = pgTable(
  "device_authorization",
  {
    id: text("id").primaryKey(),
    deviceId: text("deviceId").references(() => device.id, { onDelete: "cascade" }),
    householdId: text("householdId").notNull(),
    code: text("code").notNull().unique(),
    qrCode: text("qrCode"),
    expiresAt: timestamp("expiresAt").notNull(),
    isUsed: boolean("isUsed").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("device_authorization_code_key").on(table.code),
    index("device_authorization_householdId_idx").on(table.householdId),
    index("device_authorization_deviceId_idx").on(table.deviceId)
  ]
);

export const photo = pgTable(
  "photo",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    householdId: text("householdId")
      .notNull()
      .references(() => household.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    filename: text("filename"),
    mimeType: text("mimeType"),
    size: integer("size"),
    width: integer("width"),
    height: integer("height"),
    metadata: text("metadata"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow()
  },
  (table) => [
    index("photo_userId_idx").on(table.userId),
    index("photo_householdId_idx").on(table.householdId)
  ]
);

export const playlist = pgTable(
  "playlist",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    householdId: text("householdId")
      .notNull()
      .references(() => household.id, { onDelete: "cascade" }),
    createdById: text("createdById")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    isActive: boolean("isActive").notNull().default(true),
    isPublic: boolean("isPublic").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow()
  },
  (table) => [
    index("playlist_householdId_idx").on(table.householdId),
    index("playlist_createdById_idx").on(table.createdById)
  ]
);

export const playlistItem = pgTable(
  "playlist_item",
  {
    id: text("id").primaryKey(),
    playlistId: text("playlistId")
      .notNull()
      .references(() => playlist.id, { onDelete: "cascade" }),
    photoId: text("photoId").references(() => photo.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(0),
    duration: integer("duration"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow()
  },
  (table) => [
    index("playlist_item_playlistId_idx").on(table.playlistId),
    index("playlist_item_photoId_idx").on(table.photoId)
  ]
);

export const playlistShare = pgTable(
  "playlist_share",
  {
    id: text("id").primaryKey(),
    playlistId: text("playlistId")
      .notNull()
      .references(() => playlist.id, { onDelete: "cascade" }),
    sharedWithUserId: text("sharedWithUserId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sharedByUserId: text("sharedByUserId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    permission: text("permission").notNull().default("view"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("playlist_share_playlistId_sharedWithUserId_key").on(
      table.playlistId,
      table.sharedWithUserId
    ),
    index("playlist_share_playlistId_idx").on(table.playlistId),
    index("playlist_share_sharedWithUserId_idx").on(table.sharedWithUserId),
    index("playlist_share_sharedByUserId_idx").on(table.sharedByUserId)
  ]
);
