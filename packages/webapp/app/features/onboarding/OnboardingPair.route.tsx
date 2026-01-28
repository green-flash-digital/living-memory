import { ssrResponse } from "~/utils.server/util.ssrResponse";
import type { Route } from "./+types/OnboardingPair.route";
import { Form, href, redirect, useActionData, useLoaderData } from "react-router";
import { validateFormData } from "~/utils.server/util.validateFormData";
import z from "zod";
import { ApiClientSSR } from "~/utils.server/ApiClient.ssr";
import { ApproveDevicePairingRequestSchema } from "@living-memories/api/onboarding";

const USER_CODE_INPUT_NAME = "user_code";

export async function loader(args: Route.LoaderArgs) {
  const currentUrl = new URL(args.request.url);
  const user_code = currentUrl.searchParams.get(USER_CODE_INPUT_NAME);
  if (user_code) {
    return ssrResponse.data({ user_code });
  }
}

export async function action(args: Route.ActionArgs) {
  console.log("Validating user_code");
  const formVal = await validateFormData(args, ApproveDevicePairingRequestSchema);
  if (!formVal.success) {
    return ssrResponse.validationError(formVal.error);
  }

  console.log("Validating device");
  const res = await ApiClientSSR.auth.raw.device({
    query: { user_code: formVal.data.user_code }
  });
  if (res.data) {
    console.log("user code is valid", res.data.user_code);
    const basePath = href("/onboarding/confirm");
    const path = `${basePath}?user_code=${res.data.user_code}`;
    console.log("Redirecting to", path);
    throw redirect(path);
  }
  return ssrResponse.error({
    error_type: "bad_request",
    status: 400,
    message: res.error.error_description
  });
}

export default function OnboardingPair() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h2>Onboarding - Pair</h2>
      <Form method="post">
        <input
          type="text"
          name={USER_CODE_INPUT_NAME}
          defaultValue={loaderData?.data?.user_code}
          placeholder="Enter device code (e.g., ABCD-1234)"
          maxLength={12}
        />
        {actionData?.valError?.user_code && (
          <div style={{ color: "red" }}>{actionData.valError.user_code}</div>
        )}
        {actionData?.error && <div>{actionData.error.message}</div>}
        <button>Continue</button>
      </Form>
    </div>
  );
}
