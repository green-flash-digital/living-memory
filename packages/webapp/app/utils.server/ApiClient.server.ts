import { MemoriesApiClientServer } from "@living-memories/api/client/server";
import { env } from "cloudflare:workers";

export const ApiClientServer = new MemoriesApiClientServer({
  baseURL: env.API_DOMAIN,
});
