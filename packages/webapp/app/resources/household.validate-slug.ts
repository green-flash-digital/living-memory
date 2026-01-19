import { getSessionContext } from "~/context/context.session";
import type { Route } from "./+types/household.validate-slug";
import { ApiClientSSR } from "~/utils.server/ApiClient.ssr";

export async function action(args: Route.ActionArgs) {
  const session = getSessionContext(args);
  const status = await ApiClientSSR.onboarding.validateHouseholdSlug(
    args.params.slug,
    args.request
  );
  console.log(status);
}
