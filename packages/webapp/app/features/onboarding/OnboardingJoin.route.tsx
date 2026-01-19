import { useRef, useState, type ChangeEvent, type ChangeEventHandler } from "react";
import { Form, href, useActionData } from "react-router";
import { match, P } from "ts-pattern";
import { useDebounce } from "~/hooks/useDebounce";
import { ApiClientReact } from "~/utils.client/ApiClient.browser";
import { toKebabCase } from "~/utils/util.string";
import type { Route } from "./+types/OnboardingJoin.route";
import { ApiClientSSR } from "~/utils.server/ApiClient.ssr";
import { actionResponse } from "~/utils.server/util.actionResponse";
import { getValidationErrors } from "~/utils/util.getValidationErrors";

const JOIN_ACTIONS = { CREATE: "create", JOIN: "join" } as const;
type JoinAction = (typeof JOIN_ACTIONS)[keyof typeof JOIN_ACTIONS];

export async function action(args: Route.ActionArgs) {
  const formData = await args.request.formData();
  const formObj = Object.fromEntries(formData.entries());
  const result = await ApiClientSSR.onboarding.createHousehold(formObj, args.request);
  return actionResponse(result, { redirectOnSuccess: href("/onboarding/pair") });
}

export default function OnboardingJoin() {
  const [joinAction, setJoinAction] = useState<JoinAction | undefined>();
  const [slugStatus, setSlugStatus] = useState<{ isAvailable: boolean } | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const slugRef = useRef<HTMLInputElement | null>(null);
  const { debounce: debounceSlug } = useDebounce(300);
  const { debounce: debounceName } = useDebounce(300);
  const actionData = useActionData<typeof action>();
  const validationErrors = getValidationErrors(actionData);

  function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    return setJoinAction(e.currentTarget.value as JoinAction);
  }

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    const name = e.currentTarget.value;
    debounceName(() => {
      if (!slugRef.current) return;
      if (!!slugRef.current.value) return;
      const slug = toKebabCase(name);
      slugRef.current.value = slug;
      if (slug) {
        handleSlugChange({ currentTarget: slugRef.current } as ChangeEvent<HTMLInputElement>);
      }
    });
  }

  function handleSlugChange(e: ChangeEvent<HTMLInputElement>) {
    const newSlug = e.currentTarget.value;
    setSlugStatus(null);

    debounceSlug(async () => {
      if (newSlug.trim() && /^[a-z0-9-]+$/.test(newSlug)) {
        setIsCheckingSlug(true);
        const res = await ApiClientReact.onboarding.validateHouseholdSlug({ slug: newSlug });
        if (res.success) {
          setSlugStatus({ isAvailable: res.data.isAvailable });
        } else {
          setSlugStatus({ isAvailable: false });
          console.error("Error validating slug:", res.error);
        }
        setIsCheckingSlug(false);
      }
    });
  }

  return (
    <div>
      <h2>Get Started</h2>
      <p>To begin sharing memories with your family, you'll need to connect to a household.</p>
      <ul>
        <li>
          <label>
            <input
              type="radio"
              name="household-action"
              value={JOIN_ACTIONS.CREATE}
              onChange={handleOnChange}
            />
            <span>Create a new household</span>
          </label>
        </li>
        <li>
          <label>
            <input
              type="radio"
              name="household-action"
              value={JOIN_ACTIONS.JOIN}
              onChange={handleOnChange}
            />
            <span>Join an existing household</span>
          </label>
        </li>
      </ul>
      <div>
        {match(joinAction)
          .with(P.nullish, () => null)
          .with("create", () => (
            <Form>
              <div>
                <label>
                  <div>Household name</div>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., The Smith Family"
                    onChange={handleNameChange}
                  />
                </label>
              </div>
              <div>
                <label>
                  <div>Household URL</div>
                  <input
                    type="text"
                    name="slug"
                    placeholder="e.g., smith-family"
                    onChange={handleSlugChange}
                    ref={slugRef}
                  />
                  <div style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
                    This will be used in your household's shareable link
                  </div>
                  {isCheckingSlug && (
                    <div style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
                      Checking availability...
                    </div>
                  )}
                  {slugStatus && !isCheckingSlug && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: slugStatus.isAvailable ? "#22c55e" : "#ef4444",
                        marginTop: "0.25rem"
                      }}
                    >
                      {slugStatus.isAvailable
                        ? "✓ This slug is available"
                        : "✗ This slug is already taken"}
                    </div>
                  )}
                </label>
              </div>
              <button type="submit" name={JOIN_ACTIONS.CREATE} value={JOIN_ACTIONS.CREATE}>
                Next
              </button>
            </Form>
          ))
          .with("join", () => <div>WIP</div>)
          .exhaustive()}
      </div>
    </div>
  );
}
