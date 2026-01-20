import { useState, useRef, type ChangeEvent } from "react";
import { useActionData, Form, href, redirect } from "react-router";
import { useDebounce } from "~/hooks/useDebounce";
import { ApiClientReact } from "~/utils.client/ApiClient.browser";
import { toKebabCase } from "~/utils/util.string";
import { ApiClientSSR } from "~/utils.server/ApiClient.ssr";
import { ssrResponse } from "~/utils.server/util.ssrResponse";
import { validateFormData } from "~/utils.server/util.validateFormData";
import type { Route } from "./+types/OnboardingHouseholdCreate.route";
import { CreateHouseholdRequestSchema } from "@living-memories/api/onboarding";

export async function action(args: Route.ActionArgs) {
  const formVal = await validateFormData(args, CreateHouseholdRequestSchema);
  if (!formVal.success) {
    return ssrResponse.validationError(formVal.error);
  }

  const res = await ApiClientSSR.onboarding.createHousehold(formVal.data, args.request);
  if (res.success) {
    throw redirect(href("/onboarding/pair"));
  }

  return ssrResponse.error(res.error);
}

export default function OnboardingCreate() {
  const [slugStatus, setSlugStatus] = useState<{ isAvailable: boolean } | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const slugRef = useRef<HTMLInputElement | null>(null);
  const { debounce: debounceSlug } = useDebounce(300);
  const { debounce: debounceName } = useDebounce(300);
  const actionData = useActionData<typeof action>();

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
      <h2>Create Your Household</h2>
      <p style={{ fontSize: "1rem", color: "#666", marginBottom: "1.5rem" }}>
        You're the first one here! Give your household a name and create a unique link to invite
        family members.
      </p>
      <Form method="POST">
        <div>
          <label>
            <div>Household Name</div>
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
            <div>Household Link</div>
            <input
              type="text"
              name="slug"
              placeholder="e.g., smith-family"
              onChange={handleSlugChange}
              ref={slugRef}
            />
            <div style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
              This creates a unique link that family members can use to join your household
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
                  ? "✓ This link is available"
                  : "✗ This link is already taken. Please try another one."}
              </div>
            )}
          </label>
        </div>
        <button type="submit">Continue</button>
      </Form>
    </div>
  );
}
