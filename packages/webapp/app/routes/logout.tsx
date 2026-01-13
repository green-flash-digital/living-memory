import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { authClient } from "../lib/auth.server";

export async function loader({}: Route.LoaderArgs) {
  await authClient.signOut();
  throw redirect("/login");
}
