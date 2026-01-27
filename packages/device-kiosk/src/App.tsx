import { useEffect, useState } from "react";
import { tryFetch } from "@living-memory/utils";

type Status = {
  state: string;
  authorized: boolean;
  playlist: string | null;
};

export default function App() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    async function loadStatus() {
      const result = await tryFetch<Status>("/status");
      if (result.success) {
        setStatus(result.data);
      } else {
        console.error("Failed to load status:", result.error);
        setStatus(null);
      }
    }
    loadStatus();
  }, []);

  useEffect(() => {
    async function startPairing() {
      const result = await tryFetch("/pair/start");
      if (result.success) {
        console.log(result.data);
      } else {
        console.error("Failed to start pairing:", result.error);
      }
    }
    startPairing();
  }, []);

  if (!status) {
    return <div>Connecting to device agent…</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Device Kiosk</h1>
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
