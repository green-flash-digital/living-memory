import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/sign-in", "./features/auth/SignIn.route.tsx"),
  route("/", "./features/app-root/AppRoot.tsx", [
    route(":household_id", "./features/household/Household.route.tsx", [
      route(":playlist_id", "./features/playlist/Playlist.route.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
