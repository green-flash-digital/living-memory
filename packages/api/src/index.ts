import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { LivingMemoryAPIContext } from "./lib/types";
import { requireAuth } from "./middleware/auth.middleware";

const app = new Hono<LivingMemoryAPIContext>({
  strict: true,
});

// CORS middleware
app.use(
  "*",
  cors({
    origin: "*", // Configure this to your frontend domain in production
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
