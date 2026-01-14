import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./utils/auth";
import { LivingMemoryAPIContext } from "./utils/types";
import { requireAuth } from "./middleware/auth.middleware";
import { env } from "cloudflare:workers";

const app = new Hono<LivingMemoryAPIContext>({
  strict: true,
});

// CORS middleware
app.use(
  "*",
  cors({
    origin: [env.APP_DOMAIN, env.API_DOMAIN],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
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
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  return await auth.handler(c.req.raw);
});

app.get("/api/test", requireAuth, (c) => {
  return c.json({ message: "successfully logged in" });
});

export default app;
