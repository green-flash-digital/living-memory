import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { deleteHousehold } from "./delete/route.js";
import { getHousehold } from "./getSingle/route.js";

export const household = new Hono<Route<SessionVars>>()
  .route("", getHousehold)
  .route("/delete", deleteHousehold);
