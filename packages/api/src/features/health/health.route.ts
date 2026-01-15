import { Hono } from "hono";
import { Route } from "../../utils/types";

export const health = new Hono<Route>();

health.get("", (c) => {
  return c.json({ status: "ok" });
});
