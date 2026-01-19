import { HTTPError } from "@living-memory/utils";
import { auth } from "../auth.js";
import { prismaClient } from "../db/prisma-client.js";
import type { MaybeSessionVars, Middleware } from "../utils/types.js";
import { createMiddleware } from "hono/factory";

/**
 * Hono middleware that enforces authentication via Better Auth.
 *
 * - Checks for a valid session and user on each request using Better Auth.
 * - Responds with a 401 Unauthorized error if authentication fails.
 * - On success, attaches the session and user info to the context variables ("user" and "session").
 *
 * Usage: Attach this middleware to routes requiring authentication.
 */
export const withAuthenticatedSession = createMiddleware<Middleware<MaybeSessionVars>>(
  async (c, next) => {
    // Clone headers to avoid immutability issues
    const headers = new Headers(c.req.raw.headers);

    // Retrieve the session from Better Auth
    const session = await auth.api.getSession({ headers });
    if (!session || !session.user) {
      throw HTTPError.unauthenticated();
    }

    // Attach user and session to the context
    c.set("user", session.user);
    c.set("session", session.session);
    c.set("betterAuth", auth.api);
    c.set("db", prismaClient);

    return next();
  }
);
