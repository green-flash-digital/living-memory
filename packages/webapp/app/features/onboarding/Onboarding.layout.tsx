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

  // If user is already onboarded, they shouldn't be here
  // (This is a safety check - middleware should have caught this)
  if (session.user.isOnboarded) {
    throw redirect("/");
  }

  const status = await ApiClientSSR.onboarding.getStatus(args.request);
  if (!status.success) {
    throw redirect("/onboarding/error");
  }

  const currentPath = new URL(args.request.url).pathname;
  let targetRoute = href("/onboarding");

  switch (status.data.currentStep) {
    case "USER_INFO":
      targetRoute = href("/onboarding");
      break;

    case "JOIN_HOUSEHOLD":
      targetRoute = href("/onboarding/join");
      break;

    case "PAIR_DEVICE":
      targetRoute = href("/onboarding/pair");
      break;

    default:
      targetRoute = href("/onboarding/done");
      exhaustiveMatchGuard(status.data.currentStep);
  }

  if (currentPath !== targetRoute) {
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
