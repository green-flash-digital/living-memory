import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { and, eq } from "drizzle-orm";
import { schema } from "../../../db/index.js";
import { response } from "../../../utils/util.response.js";
import { HTTPError } from "@living-memory/utils";
import { DeletePlaylistResponseSchema } from "./schema.js";

/**
 * DELETE `/api/playlist/:id`
 *
 * Soft-deletes a playlist (sets `isActive=false`) scoped to the active organization (household).
 */
export const deletePlaylist = new Hono<Route<SessionVars>>().delete(
  "/:id",
  zValidator("param", z.object({ id: z.string({ error: "Missing param ':playlist-id'" }) })),
  async (c) => {
    const params = c.req.valid("param");
    const session = c.get("session");
    const db = c.get("db");

    if (!session.activeOrganizationId) {
      throw HTTPError.badRequest("No active organization selected.");
    }

    // Ensure playlist exists in active household
    const existing = await db
      .select({ id: schema.playlist.id, name: schema.playlist.name })
      .from(schema.playlist)
      .where(
        and(
          eq(schema.playlist.id, params.id),
          eq(schema.playlist.householdId, session.activeOrganizationId),
          eq(schema.playlist.isActive, true)
        )
      )
      .limit(1);

    if (!existing[0]) {
      throw HTTPError.notFound(`Playlist '${params.id}' not found.`);
    }

    await db
      .update(schema.playlist)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(schema.playlist.id, params.id),
          eq(schema.playlist.householdId, session.activeOrganizationId)
        )
      );

    return response.json(c, {
      context: "playlists.delete",
      schema: DeletePlaylistResponseSchema,
      data: { message: `Deleted playlist '${existing[0].name}'` }
    });
  }
);

