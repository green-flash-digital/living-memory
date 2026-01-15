import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/Onboarding.layout";
import { getSessionContext } from "~/context/context.session";

/**
 * Determines which onboarding step the user should be on and redirects if necessary.
 *
 * This loader runs for all onboarding routes and ensures users are on the correct step
 * based on their current onboarding state.
 *
 * Onboarding flow:
 * 1. Index (/onboarding) - Choose to create or join a household
 * 2. Create (/onboarding/create) - Create a new household
 * 3. Join (/onboarding/join) - Join an existing household via invitation
 * 4. Pair (/onboarding/pair) - Pair a device to the household
 * 5. Done (/onboarding/done) - Complete onboarding and mark user as onboarded
 */
export async function loader(args: Route.LoaderArgs) {
  const session = getSessionContext(args);
  const currentPath = new URL(args.request.url).pathname;

  // If user is already onboarded, they shouldn't be here
  // (This is a safety check - middleware should have caught this)
  if (session.user.isOnboarded) {
    throw redirect("/");
  }

  // Check if user has a household (active organization)
  const hasHousehold = session.session?.activeOrganizationId != null;

  // Determine which step the user should be on
  let targetStep: string | null = null;

  if (!hasHousehold) {
    // No household yet - should be on index (create/join choice) or create/join routes
    if (
      currentPath === "/onboarding/done" ||
      currentPath === "/onboarding/pair"
    ) {
      targetStep = "/onboarding";
    }
  } else {
    // Has household - check if device is paired
    // TODO: Check if user has paired a device
    // For now, assume if they have a household, they should pair or be done
    // You'll need to implement device pairing check based on your API
    const hasPairedDevice = false; // TODO: Implement device pairing check

    if (!hasPairedDevice) {
      // Has household but no device - should be on pair step
      if (
        currentPath !== "/onboarding/pair" &&
        currentPath !== "/onboarding/done"
      ) {
        targetStep = "/onboarding/pair";
      }
    } else {
      // Has household and device - should be on done step
      if (currentPath !== "/onboarding/done") {
        targetStep = "/onboarding/done";
      }
    }
  }

  // Redirect to the correct step if needed
  if (targetStep) {
    throw redirect(targetStep);
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
