import { getSessionContext, sessionContext } from "../context/context.session";
import type { ContextAndRequest } from "~/utils.server/util.server.types";
import { AuthClientSSR } from "~/utils.server/SSRAuthClient";
import { href, redirect } from "react-router";
import { AuthClient } from "~/utils.client/api.client";

export async function requireOnboarding<T extends ContextAndRequest>(args: T) {
  const session = getSessionContext(args);

  if (session.user.)



  const session = getSession;
  const session = await AuthClientSSR.getSession(args);
  if (!session?.session) {
    throw redirect(href("/sign-in"));
  }

  // Set the session data in context
  args.context.set(sessionContext, session);
}
