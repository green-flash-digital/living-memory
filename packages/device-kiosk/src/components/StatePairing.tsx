import type { StatusPairing } from "@living-memory/device-agent/types";
import { QRCodeSVG } from "qrcode.react";

export function StatePairing(props: StatusPairing) {
  return (
    <div>
      <h2>Pairing</h2>
      <h3>
        <pre>{props.user_code}</pre>
      </h3>
      <QRCodeSVG
        value={props.verification_uri_complete}
        size={200}
        bgColor="#FFFFFF"
        fgColor="#000000"
        level={"L"}
      />
    </div>
  );
}
