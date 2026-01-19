import { useState, type ChangeEvent } from "react";
import { Form } from "react-router";
import { match, P } from "ts-pattern";

const START_ACTIONS = { CREATE: "create", JOIN: "join" } as const;
type StartAction = (typeof START_ACTIONS)[keyof typeof START_ACTIONS];

export default function OnboardingJoin() {
  const [startAction, setStartAction] = useState<StartAction | undefined>();

  function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    return setStartAction(e.currentTarget.value as StartAction);
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
                  <input type="text" name="name" placeholder="e.g., The Smith Family" />
                </label>
              </div>
              <div>
                <label>
                  <div>Household URL</div>
                  <input
                    type="text"
                    name="slug"
                    placeholder="e.g., smith-family"
                    onChange={fetcher}
                  />
                  <div style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
                    This will be used in your household's shareable link
                  </div>
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
