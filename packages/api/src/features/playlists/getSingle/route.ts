import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { and, eq } from "drizzle-orm";
import { schema } from "../../../db/index.js";
import { response } from "../../../utils/util.response.js";
import { HTTPError } from "@living-memory/utils";
import { GetSinglePlaylistResponseSchema } from "./schema.js";

/**
 * GET `/api/playlist/:id`
 *
 * Returns a single playlist by `:id`, scoped to the user's active organization (household).
 */
export const getSingle = new Hono<Route<SessionVars>>().get(
  "/:id",
  zValidator("param", z.object({ id: z.string({ error: "Missing param ':playlist-id'" }) })),
  async (c) => {
    const params = c.req.valid("param");
    const session = c.get("session");
    const db = c.get("db");

    if (!session.activeOrganizationId) {
      throw HTTPError.badRequest("No active organization selected.");
    }

    const rows = await db
      .select()
      .from(schema.playlist)
      .where(
        and(
          eq(schema.playlist.id, params.id),
          eq(schema.playlist.householdId, session.activeOrganizationId),
          eq(schema.playlist.isActive, true)
        )
      )
      .limit(1);

    const playlist = rows[0];
    if (!playlist) {
      throw HTTPError.notFound(`Playlist '${params.id}' not found.`);
    }

    return response.json(c, {
      context: "playlists.getSingle",
      schema: GetSinglePlaylistResponseSchema,
      data: { playlist }
    });
  }
);

