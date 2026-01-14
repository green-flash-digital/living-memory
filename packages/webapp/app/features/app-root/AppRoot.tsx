import { Outlet } from "react-router";
import type { Route } from "./+types/AppRoot";
import { requireSession } from "~/middleware/middleware.session";
import { sessionContext } from "~/context/context.session";

export const middleware: Route.MiddlewareFunction[] = [requireSession];

export async function loader(args: Route.LoaderArgs) {
  const session = args.context.get(sessionContext);

  return { isOnboarded: true };
}

export default function AppRoot(args: Route.ComponentProps) {
  if (!args.loaderData.isOnboarded) {
    return <div>onboarding</div>;
  }
  return (
    <div>
      <h1>App Root</h1>
      <Outlet />
    </div>
  );
}
