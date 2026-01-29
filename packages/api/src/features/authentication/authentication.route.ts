import { Hono } from "hono";
import { createAuth } from "../../auth.js";
import { createDb } from "../../db/index.js";
import type { MaybeSessionVars, Route } from "../../utils/types.js";

export const authentication = new Hono<Route<MaybeSessionVars>>();

authentication.all("*", async (c) => {
  const { db, close } = createDb();
  const auth = createAuth(db);
  try {
    return auth.handler(c.req.raw);
  } finally {
    await close?.();
  }
});
