import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { and, eq } from "drizzle-orm";
import { schema } from "../../../db/index.js";
import { response } from "../../../utils/util.response.js";
import { GetPlaylistListResponseSchema } from "./schema.js";

/**
 * GET `/api/playlist`
 *
 * Returns a list of playlists for the user's active organization (household).
 */
export const getList = new Hono<Route<SessionVars>>().get("", async (c) => {
  const session = c.get("session");
  const db = c.get("db");

  const playlists = session.activeOrganizationId
    ? await db
        .select()
        .from(schema.playlist)
        .where(
          and(
            eq(schema.playlist.householdId, session.activeOrganizationId),
            eq(schema.playlist.isActive, true)
          )
        )
    : [];

  return response.json(c, {
    context: "playlists.getList",
    schema: GetPlaylistListResponseSchema,
    data: { playlists }
  });
});

