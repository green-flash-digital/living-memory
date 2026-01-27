import type { StatusIdle } from "@living-memory/device-agent/types";
import { tryFetch } from "@living-memory/utils";
import { useEffect } from "react";

export function StateIdle(props: StatusIdle) {
  useEffect(() => {
    async function startPairing() {
      await tryFetch("/pair/start");
    }
    startPairing();
  }, []);

  return (
    <div>
      <h2>Idle</h2>
      <p>Device is ready and waiting...</p>
    </div>
  );
}
