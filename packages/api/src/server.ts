import { Hono } from "hono";
import { cors } from "hono/cors";
import { withAuthenticatedSession } from "./middleware/session.middleware";
import { env } from "cloudflare:workers";
import { authentication } from "./features/authentication/authentication.route";
import { health } from "./features/health/health.route";
import { onboarding } from "./features/onboarding/onboarding.route._";

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

export default app;
