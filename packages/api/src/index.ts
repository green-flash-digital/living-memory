import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Hello from Living Memory API!" });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export default app;
