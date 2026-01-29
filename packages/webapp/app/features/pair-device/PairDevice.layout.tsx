import { href, Outlet, redirect } from "react-router";
import type { Route } from "./+types/PairDevice.layout";

export async function loader(args: Route.LoaderArgs) {}

export default function PairDeviceLayout() {
  return (
    <>
      <h1>Pair Device</h1>
      <Outlet />
    </>
  );
}
