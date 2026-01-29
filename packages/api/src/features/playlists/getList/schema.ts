import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";

export type Playlist = {
  id: string;
  name: string;
  description: string | null;
  householdId: string;
  createdById: string;
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const PlaylistSchema = schemaFor<Playlist>({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  householdId: z.string(),
  createdById: z.string(),
  isActive: z.boolean(),
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type GetPlaylistListResponse = {
  playlists: Playlist[];
};

export const GetPlaylistListResponseSchema = schemaFor<GetPlaylistListResponse>({
  playlists: z.array(PlaylistSchema)
});

