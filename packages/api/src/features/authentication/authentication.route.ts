import { Hono } from "hono";
import { auth } from "../../auth";
import type { MaybeSessionVars, Route } from "../../utils/types";

export const authentication = new Hono<Route<MaybeSessionVars>>();

authentication.all("*", async (c) => {
  const res = auth.handler(c.req.raw);
  return res;
});
