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

// Better Auth routes
app.on(["GET", "POST"], "/api/auth/*", async (c) => {
  return auth.handler(c.req.raw);
});

// Root endpoint
app.get("/", (c) => {
  return c.json({ message: "Hello from Living Memory API!" });
});

app.get("/test", requireAuth, (c) => {
  return c.json({ message: "successfully logged in" });
});

export default app;
