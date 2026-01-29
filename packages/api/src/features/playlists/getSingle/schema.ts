import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";
import { type Playlist, PlaylistSchema } from "../getList/schema.js";

export type GetSinglePlaylistResponse = {
  playlist: Playlist;
};

export const GetSinglePlaylistResponseSchema = schemaFor<GetSinglePlaylistResponse>({
  playlist: PlaylistSchema
});

