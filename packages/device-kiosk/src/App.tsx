import { useEffect, useState } from "react";

type Status = {
  state: string;
  authorized: boolean;
  playlist: string | null;
};

export default function App() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/status")
      .then((res) => res.json())
      .then(setStatus)
      .catch((err) => {
        console.error(err);
        setStatus(null);
      });
  }, []);

  useEffect(() => {
    async function startPairing() {
      try {
        const res = await fetch("/pair/start");
        const json = await res.json();
        console.log(json);
      } catch (error) {
        throw new Error(String(error));
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
