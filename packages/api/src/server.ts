import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { LivingMemoryAPIContext } from "./utils/types";
import { requireAuth } from "./middleware/auth.middleware";
import { env } from "cloudflare:workers";

const app = new Hono<LivingMemoryAPIContext>({
  strict: true,
});

app.use(
  "*",
  cors({
    origin: [env.APP_DOMAIN],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["*"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// Health check (public)
app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

// Better Auth routes - handle all methods for /api/auth/*
app.all("/api/auth/*", async (c) => {
  const res = auth.handler(c.req.raw);
  return res;
});

app.get("/api/test", requireAuth, (c) => {
  return c.json({ message: "successfully logged in" });
});

export default app;
