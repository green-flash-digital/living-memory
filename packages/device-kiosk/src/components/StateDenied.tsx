import type { StatusDenied } from "@living-memory/device-agent/types";

export function StateDenied(props: StatusDenied) {
  return (
    <div>
      <h2>Access Denied</h2>
      {props.message && <p>{props.message}</p>}
    </div>
  );
}
