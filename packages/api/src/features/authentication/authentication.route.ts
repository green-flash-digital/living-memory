import { Hono } from "hono";
import { auth } from "../../auth.js";
import type { MaybeSessionVars, Route } from "../../utils/types.js";

export const authentication = new Hono<Route<MaybeSessionVars>>();

authentication.all("*", async (c) => {
  const res = auth.handler(c.req.raw);
  return res;
});
