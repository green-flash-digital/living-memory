import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { MemoriesApiClientSSR } from "@living-memories/api/client/ssr";
import { HTTPError } from "@living-memory/utils";

const API_DOMAIN = "http://localhost:12000";
const AGENT_CLIENT_ID = "livingmemory-agent:local";

const ApiClient = new MemoriesApiClientSSR({ baseURL: API_DOMAIN });

const isProd = process.env.NODE_ENV === "production";

const app = new Hono();

app.use("*", cors());

app.get("/status", (c) => {
  return c.json({
    state: "BOOTING",
    authorized: false,
    playlist: null
  });
});

app.get("/pair/start", async (c) => {
  const res = await ApiClient.auth.raw.device.code({
    client_id: AGENT_CLIENT_ID,
    scope: "openid profile email"
  });
  if (res.error) {
    throw HTTPError.serverError("There was an issue when trying to start the pairing process");
  }
  return c.json(res.data);
});

if (isProd) {
  app.use("/*", serveStatic({ root: "../device-kiosk/dist" }));
} else {
  app.get("/", (c) => c.text("Agent running (dev). Start kiosk via Vite."));
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
