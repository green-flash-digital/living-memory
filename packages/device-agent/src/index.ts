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

const statusManager = new StatusManager(DEVICE_CODE_DESTINATION, AGENT_CLIENT_ID);

app.use("*", cors());

app.get("/status", (c) => {
  return c.json(statusManager.getStatus());
});

// Device Pairing
export type PairDeviceStateResponse = {
  user_code: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
};

app.get("/pair/start", async (c) => {
  if (statusManager.isAuthorized()) return c.body(null, 204);
  if (statusManager.isPairing()) return c.body(null, 204);

  const res = await ApiClient.auth.raw.device.code({
    client_id: AGENT_CLIENT_ID,
    scope: "openid profile email"
  });
  if (res.error) {
    throw HTTPError.serverError("There was an issue when trying to start the pairing process");
  }

  await statusManager.setPairing(res.data);

  return c.json(res.data);
});

if (isProd) {
  app.use("/*", serveStatic({ root: "../device-kiosk/dist" }));
} else {
  app.get("/", (c) => c.text("Agent running (dev). Start kiosk via Vite."));
}

async function boot() {
  const deviceAuth = await statusManager.readDeviceAuth();
  if (deviceAuth.access_token) {
  }
  statusManager.setIdle();
}

serve(
  {
    fetch: app.fetch,
    port: 13_000
  },
  (info) => {
    console.log(`Agent running on http://localhost:${info.port}`);
  }
);
