import { redirect, href } from "react-router";
import type { Route } from "./+types/PairDeviceConfirm.route";

export async function loader(args: Route.LoaderArgs) {
  const currentUrl = new URL(args.request.url);
  console.log(currentUrl.searchParams);
  if (!currentUrl.searchParams.has("user_code")) {
    throw redirect(href("/pair-device"));
  }
}

export default function PairDeviceConfirmRoute() {
  return <div>pair device confirm</div>;
}
