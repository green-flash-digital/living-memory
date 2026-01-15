import { sessionContext } from "../context/context.session";
import type { ContextAndRequest } from "~/utils.server/util.server.types";
import { href, redirect } from "react-router";
import { ApiClientServer } from "~/utils.server/ApiClient.server";

/**
 * Ensures that the current request is associated with a valid session.
 *
 * If no session is found for the incoming request, this function redirects to the sign-in page.
 * If a session exists, it will be set in the appropriate React Router context for downstream consumption.
 *
 * Additionally, if the user is not onboarded and not already on an onboarding route,
 * they will be redirected to the onboarding flow.
 */
export async function requireSession<T extends ContextAndRequest>(args: T) {
  const session = await ApiClientServer.auth.api.getSession(args.request);
  if (!session?.session) {
    throw redirect(href("/sign-in"));
  }

  // Set the session data in context
  args.context.set(sessionContext, session);

  // Check if user needs onboarding
  // If not onboarded and not already on an onboarding route, redirect to onboarding
  if (!session.user.isOnboarded) {
    const currentPath = new URL(args.request.url).pathname;
    const isOnboardingRoute = currentPath.startsWith("/onboarding");

    if (!isOnboardingRoute) {
      throw redirect(href("/onboarding"));
    }
  }
}
