import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";

export type DeletePlaylistResponse = {
  message: string;
};

export const DeletePlaylistResponseSchema = schemaFor<DeletePlaylistResponse>({
  message: z.string()
});

