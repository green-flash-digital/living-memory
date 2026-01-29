import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import { schema } from "../../../db/index.js";
import { response } from "../../../utils/util.response.js";
import { HTTPError } from "@living-memory/utils";
import { CreatePlaylistRequestSchema, CreatePlaylistResponseSchema } from "./schema.js";

/**
 * POST `/api/playlist`
 *
 * Creates a playlist for the active organization (household).
 */
export const createPlaylist = new Hono<Route<SessionVars>>().post(
  "",
  zValidator("json", CreatePlaylistRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    const session = c.get("session");
    const user = c.get("user");
    const db = c.get("db");

    if (!session.activeOrganizationId) {
      throw HTTPError.badRequest("No active organization selected.");
    }

    const now = new Date();
    const playlist = {
      id: crypto.randomUUID(),
      name: body.name,
      description: body.description ?? null,
      householdId: session.activeOrganizationId,
      createdById: user.id,
      isActive: true,
      isPublic: body.isPublic ?? false,
      createdAt: now,
      updatedAt: now
    };

    await db.insert(schema.playlist).values(playlist);

    return response.json(c, {
      context: "playlists.create",
      schema: CreatePlaylistResponseSchema,
      data: { playlist }
    });
  }
);

