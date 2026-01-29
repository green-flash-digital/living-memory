import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";

export type PlaylistPhoto = {
  playlistItemId: string;
  order: number;
  duration: number | null;
  photoId: string;
  userId: string;
  householdId: string;
  url: string;
  filename: string | null;
  mimeType: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const PlaylistPhotoSchema = schemaFor<PlaylistPhoto>({
  playlistItemId: z.string(),
  order: z.number(),
  duration: z.number().nullable(),
  photoId: z.string(),
  userId: z.string(),
  householdId: z.string(),
  url: z.string(),
  filename: z.string().nullable(),
  mimeType: z.string().nullable(),
  size: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type GetPlaylistPhotosResponse = {
  photos: PlaylistPhoto[];
};

export const GetPlaylistPhotosResponseSchema = schemaFor<GetPlaylistPhotosResponse>({
  photos: z.array(PlaylistPhotoSchema)
});

