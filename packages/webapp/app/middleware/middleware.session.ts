import { sessionContext } from "../context/context.session";
import type { ContextAndRequest } from "~/utils.server/util.server.types";
import { href, redirect } from "react-router";
import { ApiClientSSR } from "~/utils.server/ApiClient.ssr";

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
  console.log("Running session middleware");
  const currentUrl = new URL(args.request.url);
  const currentSearchParams = currentUrl.searchParams;
  const currentPath = new URL(args.request.url).pathname;

  const res = await ApiClientSSR.auth.getSession(args.request);
  if (res.error) throw res.error;
  if (!res.data?.session) {
    throw redirect(href("/sign-in"));
  }

  // Set the session data in context
  args.context.set(sessionContext, res.data);

  console.log({
    currentPath,
    currentSearchParams: currentSearchParams.toString()
  });

  // Check if user needs onboarding
  // If not onboarded and not already on an onboarding route, redirect to onboarding
  // Preserve query params (e.g., user_code for device pairing)
  if (!res.data.user.isOnboarded) {
    const isOnboardingRoute = currentPath.startsWith("/onboarding");
    if (!isOnboardingRoute) {
      const qs = currentSearchParams.toString();
      const redirectPath = qs ? `${href("/onboarding")}?${qs}` : href("/onboarding");
      throw redirect(redirectPath);
    }
  }
}
