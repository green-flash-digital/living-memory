import type { StatusExpired } from "@living-memory/device-agent/types";

export function StateExpired(props: StatusExpired) {
  return (
    <div>
      <h2>Pairing Expired</h2>
      {props.message && <p>{props.message}</p>}
    </div>
  );
}
