import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { MemoriesApiClientSSR } from "@living-memories/api/client/ssr";
import { HTTPError } from "@living-memory/utils";
import path from "node:path";

import { StatusManager } from "./StatusManager.js";

/* -------- ENV VARS --------- */
const API_DOMAIN = "http://localhost:12000";
const AGENT_CLIENT_ID = "livingmemory-agent:local";
const DEVICE_CODE_DESTINATION = path.resolve(import.meta.dirname, "../device-auth.json");

const ApiClient = new MemoriesApiClientSSR({ baseURL: API_DOMAIN });

const isProd = process.env.NODE_ENV === "production";

const app = new Hono();

const Status = new StatusManager(DEVICE_CODE_DESTINATION, AGENT_CLIENT_ID);

app.use("*", cors());

app.get("/status", (c) => {
  return c.json(Status.getStatus());
});

// Device Pairing
export type PairDeviceStateResponse = {
  user_code: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
};

app.get("/pair/start", async (c) => {
  if (Status.isAuthorized()) return c.body(null, 204);
  if (Status.isPairing()) return c.body(null, 204);

  const res = await ApiClient.auth.raw.device.code({
    client_id: AGENT_CLIENT_ID,
    scope: "openid profile email"
  });
  if (res.error) {
    throw HTTPError.serverError("There was an issue when trying to start the pairing process");
  }

  await Status.setPairing(res.data);

  poll({ pollingFrequencyInSeconds: res.data.interval, deviceCode: res.data.device_code });

  return c.body(null, 204);
});

if (isProd) {
  app.use("/*", serveStatic({ root: "../device-kiosk/dist" }));
} else {
  app.get("/", (c) => c.text("Agent running (dev). Start kiosk via Vite."));
}

async function poll(args: { pollingFrequencyInSeconds: number; deviceCode: string }) {
  let pollingInterval = 5; // Start with 5 seconds

  const deviceAuth = await Status.readDeviceAuth();

  const pollForToken = async () => {
    console.log("Polling...");
    const res = await ApiClient.auth.raw.device.token({
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      client_id: deviceAuth.client_id,
      device_code: args.deviceCode,
      fetchOptions: {
        headers: {
          "user-agent": AGENT_CLIENT_ID
        }
      }
    });
    console.log(res);

    if (res.data?.access_token) {
      console.log("Authorization successful!");
      Status.setAuthorized(res.data);
    } else if (res.error) {
      switch (res.error.error) {
        case "authorization_pending":
          // Continue polling
          break;
        case "slow_down":
          pollingInterval += 5;
          break;
        case "access_denied":
          return Status.setDenied("Access was denied by the user");
        case "expired_token":
          return Status.setExpired("The device code has expired. Please try again.");
        default:
          return Status.setError(`Error: ${res.error.error_description}`);
      }
      setTimeout(pollForToken, pollingInterval * 1000);
    }
  };

  pollForToken();
}

async function boot() {
  try {
    const deviceAuth = await Status.readDeviceAuth();
    if (deviceAuth.access_token) {
      // Verify the access token by attempting to get the session
      const sessionResult = await ApiClient.auth.raw.getSession({
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${deviceAuth.access_token}`
          }
        }
      });

      if (sessionResult.data?.user) {
        return Status.setStatus({
          state: "AUTHORIZED",
          authorized: true,
          playlist: null
        });
      }
    }
    Status.setIdle();
  } catch (error) {
    Status.setIdle();
  }
}

void boot();

serve(
  {
    fetch: app.fetch,
    port: 13_000
  },
  (info) => {
    console.log(`Agent running on http://localhost:${info.port}`);
  }
);
