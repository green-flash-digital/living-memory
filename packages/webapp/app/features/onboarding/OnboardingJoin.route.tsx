import { useRef, useState, type ChangeEvent, type ChangeEventHandler } from "react";
import { Form } from "react-router";
import { match, P } from "ts-pattern";
import { useDebounce } from "~/hooks/useDebounce";
import { ApiClientReact } from "~/utils.client/ApiClient.browser";
import { toKebabCase } from "~/utils/util.string";

const START_ACTIONS = { CREATE: "create", JOIN: "join" } as const;
type StartAction = (typeof START_ACTIONS)[keyof typeof START_ACTIONS];

type SlugValidationResult = { isAvailable: boolean } | null;

export default function OnboardingJoin() {
  const [startAction, setStartAction] = useState<StartAction | undefined>();
  const [slugStatus, setSlugStatus] = useState<SlugValidationResult>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const slugRef = useRef<HTMLInputElement | null>(null);
  const { debounce: debounceSlug } = useDebounce(300);
  const { debounce: debounceName } = useDebounce(300);

  function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    return setStartAction(e.currentTarget.value as StartAction);
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
              value={START_ACTIONS.CREATE}
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
              value={START_ACTIONS.JOIN}
              onChange={handleOnChange}
            />
            <span>Join an existing household</span>
          </label>
        </li>
      </ul>
      <div>
        {match(startAction)
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
            </Form>
          ))
          .with("join", () => <div>WIP</div>)
          .exhaustive()}
      </div>
    </div>
  );
}
