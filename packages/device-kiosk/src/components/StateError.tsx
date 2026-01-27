import type { StatusError } from "@living-memory/device-agent/types";

export function StateError(props: StatusError) {
  return (
    <div>
      <h2>Error</h2>
      {props.message && <p>{props.message}</p>}
    </div>
  );
}
