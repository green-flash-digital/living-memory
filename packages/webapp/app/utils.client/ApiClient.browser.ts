import { MemoriesApiClientReact } from "@living-memories/api/client/react";
import { env } from "cloudflare:workers";

export const ApiClientReact = new MemoriesApiClientReact({
  baseURL: env.API_DOMAIN,
});
