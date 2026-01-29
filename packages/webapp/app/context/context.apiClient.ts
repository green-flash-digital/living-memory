import { MemoriesApiClientSSR } from "@living-memories/api/client/ssr";
import { createContext } from "react-router";
import { cloudflareContext } from "~/context/context.cloudflare";
import type { ContextAndRequest } from "~/utils.server/util.server.types";

export const apiClientContext = createContext<MemoriesApiClientSSR>();

export function createApiClient(baseURL: string) {
  return new MemoriesApiClientSSR({ baseURL });
}

/**
 * Gets an SSR API client for the current request.
 *
 * The client is cached on the React Router `context` for this request,
 * so downstream loaders/actions/middleware can reuse it.
 */
export async function getApiClient<T extends ContextAndRequest>(args: T) {
  const existing = args.context.get(apiClientContext);
  if (existing) return existing;

  const cf = args.context.get(cloudflareContext);
  if (!cf) throw new Error("Cloudflare context is not available");
  if (!cf.env.API_DOMAIN) {
    throw new Error(
      "Missing `API_DOMAIN` (Cloudflare env var). Define it in `wrangler.jsonc` vars or a `.dev.vars`/secret for local dev."
    );
  }

  const client = createApiClient(cf.env.API_DOMAIN);
  args.context.set(apiClientContext, client);
  return client;
}
