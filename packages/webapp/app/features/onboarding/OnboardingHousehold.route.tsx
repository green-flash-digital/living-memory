import { Form, href, Link, redirect } from "react-router";
import type { Route } from "./+types/OnboardingHousehold.route";
import { exhaustiveMatchGuard, tryHandle } from "@living-memory/utils";
import { ApiClientSSR } from "~/utils.server/ApiClient.ssr";

const OPTIONS = {
  CREATE: "create",
  JOIN: "join"
} as const;

export async function actions(args: Route.ActionArgs) {
  const formData = await args.request.formData();
  const choice = OPTIONS[formData.get("choice") as keyof typeof OPTIONS];

  switch (choice) {
    case "create":
      await tryHandle(ApiClientSSR.onboarding.setStep({ step: "CREATE_HOUSEHOLD" }, args.request));
      throw redirect(href("/onboarding/household/create"));

    case "join":
      await tryHandle(ApiClientSSR.onboarding.setStep({ step: "JOIN_HOUSEHOLD" }, args.request));
      throw redirect(href("/onboarding/household/join"));

    default:
      exhaustiveMatchGuard(choice);
  }
}

export default function OnboardingJoin() {
  return (
    <div>
      <h2>Get Started</h2>
      <p>To begin sharing memories with your family, you'll need to connect to a household.</p>
      <Form method="post">
        <ul>
          <li>
            <label
              htmlFor={OPTIONS.CREATE}
              style={{
                height: 200,
                aspectRatio: 1,
                display: "grid",
                alignContent: "center",
                border: "1px solid rebeccapurple"
              }}
            >
              <input type="radio" name="choice" value={OPTIONS.CREATE} id={OPTIONS.CREATE} />
              Create a new household
            </label>
          </li>
          <li>
            <label
              htmlFor={OPTIONS.JOIN}
              style={{
                height: 200,
                aspectRatio: 1,
                display: "grid",
                alignContent: "center",
                border: "1px solid rebeccapurple"
              }}
            >
              <input type="radio" name="choice" value={OPTIONS.JOIN} id={OPTIONS.JOIN} />
              Join an existing household
            </label>
          </li>
        </ul>
        <button type="submit">Next</button>
      </Form>
    </div>
  );
}
