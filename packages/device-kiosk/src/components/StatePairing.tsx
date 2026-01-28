import type { StatusPairing } from "@living-memory/device-agent/types";
import { QRCodeSVG } from "qrcode.react";

export function StatePairing(props: StatusPairing) {
  return (
    <div>
      <h2>Pairing</h2>
      <h3>Scan the QR Code</h3>
      <QRCodeSVG
        value={props.verification_uri_complete}
        size={200}
        bgColor="#FFFFFF"
        fgColor="#000000"
        level={"L"}
      />
      <hr />
      <h3>Visit the URL and enter the code</h3>
      <div>
        <code>
          <pre>{props.user_code}</pre>
        </code>
      </div>
      <b>
        <a href={props.verification_uri}>http://localhost:12100/pair</a>
      </b>
    </div>
  );
}
