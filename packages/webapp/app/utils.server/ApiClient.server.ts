import { MemoriesApiClientServer } from "@living-memories/api/client/server";
import { env } from "cloudflare:workers";

console.log(env);

export const ApiClientServer = new MemoriesApiClientServer({
  baseUrl: env.API_DOMAIN,
});
