import { MemoriesApiClientSSR } from "@living-memories/api/client/ssr";
import { env } from "cloudflare:workers";

export const ApiClientSSR = new MemoriesApiClientSSR({
  baseURL: env.API_DOMAIN,
});
