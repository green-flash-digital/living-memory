import type { Route } from "./+types/household.validate-slug";
import { ApiClientSSR } from "~/utils.server/ApiClient.ssr";

export async function loader(args: Route.LoaderArgs) {
  console.log({ args });
  const res = await ApiClientSSR.onboarding.validateHouseholdSlug(
    { slug: args.params.slug },
    args.request
  );
  console.log(res);
  if (!res.success) {
    return { isAvailable: false };
  }
  return res.data;
}
export type HouseholdValidateSlugActionResponse = typeof loader;
