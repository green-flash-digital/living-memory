import type { StatusIdle } from "@living-memory/device-agent/types";

export function StateIdle(props: StatusIdle) {
  return (
    <div>
      <h2>Idle</h2>
      <p>Device is ready and waiting...</p>
    </div>
  );
}
