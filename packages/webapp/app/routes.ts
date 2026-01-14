import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("features/home/Home.route.tsx"),
  route("/sign-in", "features/auth/SignIn.route.tsx"),
] satisfies RouteConfig;
