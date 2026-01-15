import { MemoriesAPIClientServer } from "@living-memories/api/client/server";
import { env } from "cloudflare:workers";

export const ApiClientServer = new MemoriesAPIClientServer({
  apiDomain: env.API_DOMAIN,
});
