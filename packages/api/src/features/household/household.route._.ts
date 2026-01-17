import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { deleteHousehold } from "./household.route.deleteHousehold.js";

export const household = new Hono<Route<SessionVars>>().route(
  "/delete",
  deleteHousehold
);
