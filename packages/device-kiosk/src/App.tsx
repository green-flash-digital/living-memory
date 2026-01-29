import { match } from "ts-pattern";
import { useStatus } from "./hooks/useStatus";
import { StateBooting } from "./components/StateBooting";
import { StateIdle } from "./components/StateIdle";
import { StatePairing } from "./components/StatePairing";
import { StateAuthorized } from "./components/StateAuthorized";
import { StateDenied } from "./components/StateDenied";
import { StateExpired } from "./components/StateExpired";
import { StateError } from "./components/StateError";

export default function App() {
  const status = useStatus(3_000);

  if (!status) {
    return <div>Connecting to device agent…</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Device Kiosk</h1>
      {match(status)
        .with({ state: "BOOTING" }, (s) => <StateBooting {...s} />)
        .with({ state: "IDLE" }, (s) => <StateIdle {...s} />)
        .with({ state: "PAIRING" }, (s) => <StatePairing {...s} />)
        .with({ state: "AUTHORIZED" }, (s) => <StateAuthorized {...s} />)
        .with({ state: "DENIED" }, (s) => <StateDenied {...s} />)
        .with({ state: "EXPIRED" }, (s) => <StateExpired {...s} />)
        .with({ state: "ERROR" }, (s) => <StateError {...s} />)
        .exhaustive()}
    </div>
  );
}
