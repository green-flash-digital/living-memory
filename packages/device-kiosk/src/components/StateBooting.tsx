import type { StatusBooting } from "@living-memory/device-agent/types";

export function StateBooting(props: StatusBooting) {
  return (
    <div>
      <h2>Booting</h2>
      <p>Device is starting up...</p>
    </div>
  );
}
