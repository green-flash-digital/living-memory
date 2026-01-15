import { MemoriesApiClientBrowser } from "@living-memories/api/client/browser";
import { env } from "cloudflare:workers";

export const ApiClientBrowser = new MemoriesApiClientBrowser({
  baseUrl: env.API_DOMAIN,
});
