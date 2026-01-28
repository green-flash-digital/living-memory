import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  // Feature routes
  route("/sign-in", "./features/auth/SignIn.route.tsx"),
  route("/", "./features/app-root/AppRoot.tsx", [
    // Resource routes
    ...prefix("resource", [
      ...prefix("household", [
        route("validate-slug/:slug", "./resources/household.validate-slug.ts")
      ])
    ]),
    ...prefix("pair-device", [
      layout("./features/pair-device/PairDevice.layout.tsx", [
        index("./features/pair-device/PairDevice.route.tsx"),
        route("confirm", "./features/pair-device/PairDeviceConfirm.route.tsx"),
        route("success", "./features/pair-device/PairDeviceSuccess.route.tsx"),
        route("error", "./features/pair-device/PairDeviceError.route.tsx")
      ])
    ]),
    // Feature routes
    ...prefix("onboarding", [
      layout("./features/onboarding/Onboarding.layout.tsx", [
        index("./features/onboarding/Onboarding.index.route.tsx"),
        ...prefix("household", [
          index("./features/onboarding/OnboardingHousehold.route.tsx"),
          route("create", "./features/onboarding/OnboardingHouseholdCreate.route.tsx"),
          route("join", "./features/onboarding/OnboardingHouseholdJoin.route.tsx")
        ]),
        route("pair", "./features/onboarding/OnboardingPair.route.tsx"),
        route("confirm", "./features/onboarding/OnboardingPairConfirm.route.tsx"),
        route("done", "./features/onboarding/OnboardingDone.route.tsx"),
        route("error", "./features/onboarding/OnboardingError.route.tsx")
      ])
    ]),
    route(":household_id", "./features/household/Household.route.tsx", [
      route(":playlist_id", "./features/playlist/Playlist.route.tsx")
    ])
  ])
] satisfies RouteConfig;
