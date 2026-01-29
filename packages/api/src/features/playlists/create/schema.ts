import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";
import { PlaylistSchema, type Playlist } from "../getList/schema.js";

export type CreatePlaylistRequest = {
  name: string;
  description?: string | null;
  isPublic?: boolean;
};

export const CreatePlaylistRequestSchema = schemaFor<CreatePlaylistRequest>({
  name: z.string().min(1, "Playlist name is required"),
  description: z.string().nullable().optional(),
  isPublic: z.boolean().optional()
});

export type CreatePlaylistResponse = {
  playlist: Playlist;
};

export const CreatePlaylistResponseSchema = schemaFor<CreatePlaylistResponse>({
  playlist: PlaylistSchema
});
