import type { Route } from "./+types/household.validate-slug";
import { getApiClient } from "~/context/context.apiClient";

export async function loader(args: Route.LoaderArgs) {
  console.log({ args });
  const api = await getApiClient(args);
  const res = await api.onboarding.validateHouseholdSlug({ slug: args.params.slug }, args.request);
  console.log(res);
  if (!res.success) {
    return { isAvailable: false };
  }
  return res.data;
}
export type HouseholdValidateSlugActionResponse = typeof loader;
