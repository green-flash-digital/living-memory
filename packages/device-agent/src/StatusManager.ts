export type StatusBooting = {
  state: "BOOTING";
  authorized: false;
  playlist: string | null;
};

export type StatusIdle = {
  state: "IDLE";
  authorized: false;
  playlist: string | null;
};

export type StatusPairing = {
  state: "PAIRING";
  authorized: false;
  playlist: string | null;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_at: string; // ISO
  interval: number;
};

export type StatusAuthorized = {
  state: "AUTHORIZED";
  authorized: true;
  playlist: string | null;
};

export type StatusDenied = {
  state: "DENIED";
  authorized: false;
  playlist: string | null;
  message?: string;
};

export type StatusExpired = {
  state: "EXPIRED";
  authorized: false;
  playlist: string | null;
  message?: string;
};

export type StatusError = {
  state: "ERROR";
  authorized: false;
  playlist: string | null;
  message?: string;
};

export type Status =
  | StatusBooting
  | StatusIdle
  | StatusPairing
  | StatusAuthorized
  | StatusDenied
  | StatusExpired
  | StatusError;

export type PairingData = {
  user_code: string;
  device_code: string;
  expires_in: number;
  interval: number;
  verification_uri: string;
  verification_uri_complete: string;
};

type DeviceAuthFile = {
  client_id: string;
  device_code: string;
  access_token: string | null;
};

export class StatusManager {
  private status: Status = {
    state: "BOOTING",
    authorized: false,
    playlist: null
  };

  constructor(
    private deviceAuthPath: string,
    private clientId: string
  ) {}

  getStatus(): Status {
    return this.status;
  }

  setStatus(newStatus: Status): void {
    this.status = newStatus;
  }

  async #writeDeviceAuth(auth: DeviceAuthFile) {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(this.deviceAuthPath, JSON.stringify(auth, null, 2), "utf8");
  }

  async readDeviceAuth(): Promise<DeviceAuthFile> {
    const { readFile } = await import("node:fs/promises");
    const file = await readFile(this.deviceAuthPath, "utf8");
    return JSON.parse(file);
  }

  async setPairing(pairingData: PairingData): Promise<void> {
    const expiresAt = new Date(Date.now() + pairingData.expires_in * 1000).toISOString();

    this.setStatus({
      state: "PAIRING",
      authorized: false,
      playlist: null,
      ...pairingData,
      expires_at: expiresAt
    });

    await this.#writeDeviceAuth({
      client_id: this.clientId,
      device_code: pairingData.device_code,
      access_token: null
    });
  }

  setIdle() {
    this.setStatus({ state: "IDLE", authorized: false, playlist: null });
  }

  isAuthorized(): boolean {
    return this.status.authorized;
  }

  isPairing(): boolean {
    return this.status.state === "PAIRING";
  }

  isBooting(): boolean {
    return this.status.state === "BOOTING";
  }

  isIdle(): boolean {
    return this.status.state === "IDLE";
  }

  isError(): boolean {
    return (
      this.status.state === "DENIED" ||
      this.status.state === "EXPIRED" ||
      this.status.state === "ERROR"
    );
  }
}
