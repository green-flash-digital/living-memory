import { Hono } from "hono";
import { cors } from "hono/cors";
import { withAuthenticatedSession } from "./middleware/session.middleware";
import { env } from "cloudflare:workers";
import { authentication } from "./features/authentication/authentication.route";
import { health } from "./features/health/health.route";
import { onboarding } from "./features/onboarding/onboarding.route._";
import { serializeError } from "./utils/ApiError";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const app = new Hono({
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

// Public routes
app.route("/api/health", health);
app.route("/api/auth/", authentication);

// Private routes
app.use(withAuthenticatedSession);
app.route("/api/onboarding", onboarding);

// Error handler
app.onError((err, c) => {
  console.error(err);
  const errorResponse = serializeError(err);
  console.error(
    `Error [${errorResponse.status}] ${errorResponse.error_type}:`,
    errorResponse.message
  );
  // Use c.text() with JSON stringified and proper Content-Type header
  // Cast status to ContentfulStatusCode since error responses always have content
  console.log(errorResponse);
  return c.json(errorResponse, errorResponse.status as ContentfulStatusCode);
});

export default app;
