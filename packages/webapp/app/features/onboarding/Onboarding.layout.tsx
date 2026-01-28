import { href, Outlet, redirect } from "react-router";
import type { Route } from "./+types/Onboarding.layout";
import { getSessionContext } from "~/context/context.session";
import { ApiClientSSR } from "~/utils.server/ApiClient.ssr";
import { exhaustiveMatchGuard } from "@living-memory/utils";

/**
 * Determines which onboarding step the user should be on and redirects if necessary.
 *
 * This loader runs for all onboarding routes and ensures users are on the correct step
 * based on their current onboarding state.
 */
export async function loader(args: Route.LoaderArgs) {
  const session = getSessionContext(args);

  console.log("running onboarding loader...");

  // If user is already onboarded, they shouldn't be here
  // (This is a safety check - middleware should have caught this)
  if (session.user.isOnboarded) {
    throw redirect("/");
  }

  const status = await ApiClientSSR.onboarding.getStatus(args.request);
  if (!status.success) {
    throw redirect("/onboarding/error");
  }

  const currentUrl = new URL(args.request.url);
  const currentPath = currentUrl.pathname;
  const currentQueryString = currentUrl.searchParams.toString();
  let targetRoute = href("/onboarding");

  switch (status.data.currentStep) {
    case "USER_INFO":
      targetRoute = href("/onboarding");
      break;

    case "PICK_HOUSEHOLD_OPTION":
      targetRoute = href("/onboarding/household");
      break;

    case "CREATE_HOUSEHOLD":
      targetRoute = href("/onboarding/household/create");
      break;

    case "JOIN_HOUSEHOLD":
      targetRoute = href("/onboarding/household/join");
      break;

    case "PAIR_DEVICE": {
      const queryString = currentQueryString ? `?${currentQueryString}` : "";
      const hasUserCode = currentUrl.searchParams.has("user_code");
      const isOnPairRoute = currentPath === href("/onboarding/pair");
      const isOnConfirmRoute = currentPath === href("/onboarding/confirm");

      // Valid routes for PAIR_DEVICE step: /onboarding/pair and /onboarding/confirm
      if (isOnConfirmRoute && !hasUserCode) {
        // Can't be on confirm without user_code, redirect to pair
        targetRoute = href("/onboarding/pair");
      } else if (!isOnPairRoute && !isOnConfirmRoute) {
        // If not on a valid route, redirect to pair (preserving user_code if present)
        targetRoute = `${href("/onboarding/pair")}${queryString}`;
      } else {
        // Already on a valid route (pair or confirm), stay there with query params
        targetRoute = `${currentPath}${queryString}`;
      }
      break;
    }

    default:
      targetRoute = href("/onboarding/done");
      exhaustiveMatchGuard(status.data.currentStep);
  }

  // Compare only pathnames to avoid redirect loops when query strings are present
  const targetPath = new URL(targetRoute, args.request.url).pathname;
  if (currentPath !== targetPath) {
    throw redirect(targetRoute);
  }

  return null;
}

export default function OnboardingLayout() {
  return (
    <div>
      <h2>onboarding - layout</h2>
      <Outlet />
    </div>
  );
}
