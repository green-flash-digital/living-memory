import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { getList } from "./getList/route.js";
import { getSingle } from "./getSingle/route.js";
import { getPhotos } from "./getPhotos/route.js";
import { createPlaylist } from "./create/route.js";
import { deletePlaylist } from "./delete/route.js";

export const playlists = new Hono<Route<SessionVars>>()
  .route("", getList)
  .route("", createPlaylist)
  .route("", getPhotos)
  .route("", getSingle)
  .route("", deletePlaylist);

