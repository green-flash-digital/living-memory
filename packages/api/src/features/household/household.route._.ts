import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { deleteHousehold } from "./household.route.deleteHousehold.js";
import { getHousehold } from "./household.route.getHousehold.js";

export const household = new Hono<Route<SessionVars>>()
  .route("", getHousehold)
  .route("/delete", deleteHousehold);
