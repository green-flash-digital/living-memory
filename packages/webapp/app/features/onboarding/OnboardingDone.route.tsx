import { Form, href, redirect } from "react-router";
import type { Route } from "./+types/OnboardingDone.route";
import { getApiClient } from "~/context/context.apiClient";
import { ssrResponse } from "~/utils.server/util.ssrResponse";

export async function action(args: Route.ActionArgs) {
  const api = await getApiClient(args);
  const res = await api.onboarding.complete(args.request);
  if (res.success) {
    throw redirect(href("/"));
  }
  return ssrResponse.error(res.error);
}

export default function OnboardingDone() {
  return (
    <div>
      <h2>You're all set</h2>
      <Form method="post">
        <button type="submit">Go to your household</button>
      </Form>
    </div>
  );
}
