import { Form, href, redirect } from "react-router";
import { useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/Onboarding.index.route";
import { ApiClientSSR } from "~/utils.server/ApiClient.ssr";
import { ssrResponse } from "~/utils.server/util.ssrResponse";
import { validateFormData } from "~/utils.server/util.validateFormData";
import { UpdateUserInfoRequestSchema } from "@living-memories/api/onboarding";
import { getSessionContext } from "~/context/context.session";

export async function loader(args: Route.LoaderArgs) {
  const session = getSessionContext(args);
  const fullName = session.user.name || "";

  // Split the name into first and last name
  // If name contains a space, split on the last space
  // Otherwise, put everything in firstName
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts.length > 0 ? nameParts[0] : "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  return ssrResponse.data({
    firstName,
    lastName
  });
}

export async function action(args: Route.ActionArgs) {
  const formVal = await validateFormData(args, UpdateUserInfoRequestSchema);
  if (!formVal.success) {
    return ssrResponse.validationError(formVal.error);
  }

  const res = await ApiClientSSR.onboarding.updateUserInfo(formVal.data, args.request);
  if (res.success) {
    throw redirect(href("/onboarding/household"));
  }

  return ssrResponse.error(res.error);
}

export default function OnboardingIndex() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h2>Welcome! Let's get started</h2>
      <p style={{ fontSize: "1rem", color: "#666", marginBottom: "1.5rem" }}>
        Please tell us a bit about yourself to personalize your experience.
      </p>
      <Form method="POST">
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <div>First Name</div>
            <input
              type="text"
              name="firstName"
              defaultValue={loaderData?.data?.firstName || ""}
              placeholder="e.g., John"
              required
            />
            {actionData?.valError?.firstName && (
              <div style={{ fontSize: "0.875rem", color: "#ef4444", marginTop: "0.25rem" }}>
                {actionData.valError.firstName}
              </div>
            )}
          </label>
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label>
            <div>Last Name</div>
            <input
              type="text"
              name="lastName"
              defaultValue={loaderData?.data?.lastName || ""}
              placeholder="e.g., Smith"
              required
            />
            {actionData?.valError?.lastName && (
              <div style={{ fontSize: "0.875rem", color: "#ef4444", marginTop: "0.25rem" }}>
                {actionData.valError.lastName}
              </div>
            )}
          </label>
        </div>
        {actionData?.error && (
          <div style={{ color: "#ef4444", marginBottom: "1rem" }}>{actionData.error.message}</div>
        )}
        <button type="submit">Continue</button>
      </Form>
    </div>
  );
}
