import { Hono } from "hono";
import type { Route } from "../../utils/types";

export const health = new Hono<Route>();

health.get("", (c) => {
  return c.json({ status: "ok" });
});
