import { Form, href, redirect, useLoaderData, useActionData } from "react-router";
import type { Route } from "./+types/OnboardingPairConfirm.route";
import { ApiClientSSR } from "~/utils.server/ApiClient.ssr";
import { ssrResponse } from "~/utils.server/util.ssrResponse";
import { exhaustiveMatchGuard } from "@living-memory/utils";

const CONFIRM_ACTION = {
  approve: "approve",
  deny: "deny"
} as const;

export async function loader(args: Route.LoaderArgs) {
  const currentUrl = new URL(args.request.url);
  const userCode = currentUrl.searchParams.get("user_code");

  if (!userCode) {
    throw redirect(href("/onboarding/pair"));
  }

  // Verify the code is still valid
  const res = await ApiClientSSR.auth.raw.device({
    query: { user_code: userCode }
  });

  // Code is invalid or expired, redirect back to pair
  if (!res.data) throw redirect(href("/onboarding/pair"));

  return ssrResponse.data({ userCode });
}

export async function action(args: Route.ActionArgs) {
  const formData = await args.request.formData();
  const action = CONFIRM_ACTION[formData.get("action") as keyof typeof CONFIRM_ACTION];
  const user_code = formData.get("user_code") as string;

  if (!user_code) {
    return ssrResponse.error({
      error_type: "bad_request",
      status: 400,
      message: "User code is required"
    });
  }

  if (!action) {
    return ssrResponse.error({
      error_type: "bad_request",
      status: 400,
      message: "Invalid action"
    });
  }

  switch (action) {
    case "approve": {
      const res = await ApiClientSSR.onboarding.approveDevicePairing({ user_code }, args.request);
      console.log("HERE!!!", res);
      if (res.success) throw redirect(href("/onboarding/done"));
      return ssrResponse.error(res.error);
    }
    case "deny": {
      await ApiClientSSR.onboarding.approveDevicePairing({ user_code }, args.request);
      throw redirect(href("/onboarding/pair"));
    }

    default:
      exhaustiveMatchGuard(action);
  }
}

export default function OnboardingPairConfirmRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h2>Approve Device</h2>
      <p>A device is requesting access to your account.</p>
      <p>Code: {loaderData?.data?.userCode}</p>

      {actionData?.error && <div style={{ color: "red" }}>{actionData.error.message}</div>}

      <Form method="post">
        <input type="hidden" name="user_code" value={loaderData?.data?.userCode || ""} />
        <button type="submit" name="action" value={CONFIRM_ACTION.approve}>
          Approve Device
        </button>
        <button type="submit" name="action" value={CONFIRM_ACTION.deny}>
          Deny
        </button>
      </Form>
    </div>
  );
}
