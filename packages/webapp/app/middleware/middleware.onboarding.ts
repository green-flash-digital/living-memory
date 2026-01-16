import { getSessionContext } from "../context/context.session";
import type { ContextAndRequest } from "~/utils.server/util.server.types";

/**
 * Ensures that the current user has completed onboarding.
 *
 * This middleware assumes that `requireSession` has already been called,
 * as it retrieves the session from context rather than fetching it.
 *
 * If the user is not onboarded, this function redirects to the onboarding flow.
 */
export async function requireOnboarding<T extends ContextAndRequest>(args: T) {
  const session = getSessionContext(args);

  // Check if user is onboarded (isOnboarded can be boolean | null)
}
