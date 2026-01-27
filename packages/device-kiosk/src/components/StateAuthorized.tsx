import type { StatusAuthorized } from "@living-memory/device-agent/types";

export function StateAuthorized(props: StatusAuthorized) {
  return (
    <div>
      <h2>Authorized</h2>
      <p>Device is authorized and ready to use.</p>
    </div>
  );
}
