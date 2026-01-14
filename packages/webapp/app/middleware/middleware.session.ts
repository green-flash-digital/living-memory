import { sessionContext } from "../context/context.session";
import type { ContextAndRequest } from "~/utils.server/util.server.types";
import { AuthClientSSR } from "~/utils.server/SSRAuthClient";
import { href, redirect } from "react-router";

/**
 * Ensures that the current request is associated with a valid session.
 *
 * If no session is found for the incoming request, this function redirects to the sign-in page.
 * If a session exists, it will be set in the appropriate React Router context for downstream consumption.
 */
export async function requireSession<T extends ContextAndRequest>(args: T) {
  const session = await AuthClientSSR.getSession(args);
  if (!session?.session) {
    throw redirect(href("/sign-in"));
  }

  // Set the session data in context
  args.context.set(sessionContext, session);
}
