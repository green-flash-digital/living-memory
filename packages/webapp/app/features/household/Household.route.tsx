import { Outlet } from "react-router";
import type { Route } from "./+types/Household.route";

export default function (args: Route.ComponentProps) {
  return (
    <div>
      <h1>Household: {args.params.household_id}</h1>
      <Outlet />
    </div>
  );
}
