import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { schema } from "../../../db/index.js";
import { response } from "../../../utils/util.response.js";
import { HTTPError } from "@living-memory/utils";
import { GetPlaylistPhotosResponseSchema } from "./schema.js";

/**
 * GET `/api/playlist/:id/photos`
 *
 * Returns all photos for the given playlist, scoped to the user's active organization (household).
 */
export const getPhotos = new Hono<Route<SessionVars>>().get(
  "/:id/photos",
  zValidator("param", z.object({ id: z.string({ error: "Missing param ':playlist-id'" }) })),
  async (c) => {
    const params = c.req.valid("param");
    const session = c.get("session");
    const db = c.get("db");

    if (!session.activeOrganizationId) {
      throw HTTPError.badRequest("No active organization selected.");
    }

    // Ensure playlist exists in active household
    const playlist = await db
      .select({ id: schema.playlist.id })
      .from(schema.playlist)
      .where(
        and(
          eq(schema.playlist.id, params.id),
          eq(schema.playlist.householdId, session.activeOrganizationId),
          eq(schema.playlist.isActive, true)
        )
      )
      .limit(1);

    if (!playlist[0]) {
      throw HTTPError.notFound(`Playlist '${params.id}' not found.`);
    }

    const rows = await db
      .select({
        playlistItemId: schema.playlistItem.id,
        order: schema.playlistItem.order,
        duration: schema.playlistItem.duration,
        photoId: schema.photo.id,
        userId: schema.photo.userId,
        householdId: schema.photo.householdId,
        url: schema.photo.url,
        filename: schema.photo.filename,
        mimeType: schema.photo.mimeType,
        size: schema.photo.size,
        width: schema.photo.width,
        height: schema.photo.height,
        metadata: schema.photo.metadata,
        createdAt: schema.photo.createdAt,
        updatedAt: schema.photo.updatedAt
      })
      .from(schema.playlistItem)
      .innerJoin(schema.photo, eq(schema.photo.id, schema.playlistItem.photoId))
      .where(
        and(
          eq(schema.playlistItem.playlistId, params.id),
          isNotNull(schema.playlistItem.photoId)
        )
      )
      .orderBy(asc(schema.playlistItem.order), asc(schema.playlistItem.createdAt));

    return response.json(c, {
      context: "playlists.getPhotos",
      schema: GetPlaylistPhotosResponseSchema,
      data: { photos: rows }
    });
  }
);

