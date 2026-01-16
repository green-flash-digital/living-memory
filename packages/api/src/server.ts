import { Hono } from "hono";
import { cors } from "hono/cors";
import { withAuthenticatedSession } from "./middleware/session.middleware";
import { env } from "cloudflare:workers";
import { authentication } from "./features/authentication/authentication.route";
import { health } from "./features/health/health.route";
import { onboarding } from "./features/onboarding/onboarding.route._";
import { serializeError, ApiError } from "./utils/ApiError";

const app = new Hono({
  strict: true,
});

// Global error handler - catches all errors and serializes them to ErrorResponse format
app.onError((err, c) => {
  const errorResponse = serializeError(err);
  console.error(`Error [${errorResponse.status}] ${errorResponse.error_type}:`, errorResponse.message);
  return c.json(errorResponse, errorResponse.status);
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

// Public routes
app.route("/api/health", health);
app.route("/api/auth/", authentication);

// Private routes
app.use(withAuthenticatedSession);
app.route("/api/onboarding", onboarding);

export default app;
