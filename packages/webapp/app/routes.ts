import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("/sign-in", "./features/auth/SignIn.route.tsx"),
  route("/", "./features/app-root/AppRoot.tsx", [
    ...prefix("onboarding", [
      layout("./features/onboarding/Onboarding.layout.tsx", [
        index("./features/onboarding/Onboarding.index.route.tsx"),
        route("create", "./features/onboarding/OnboardingCreate.route.tsx"),
        route("join", "./features/onboarding/OnboardingJoin.route.tsx"),
        route("pair", "./features/onboarding/OnboardingPair.route.tsx"),
        route("done", "./features/onboarding/OnboardingDone.route.tsx"),
        route("error", "./features/onboarding/OnboardingError.route.tsx"),
      ]),
    ]),
    route(":household_id", "./features/household/Household.route.tsx", [
      route(":playlist_id", "./features/playlist/Playlist.route.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
