import { createContext, RouterContextProvider } from "react-router";
import type { ContextAndRequest } from "./types";

export type CloudflareContext = {
  env: Env;
  ctx: ExecutionContext;
};
export const cloudflareContext = createContext<CloudflareContext>();

export async function getCFContext<T extends ContextAndRequest>({
  context,
}: T) {
  // Get Cloudflare context to access env variables
  const cloudflare = context.get(cloudflareContext);
  if (!cloudflare) {
    throw new Error("Cloudflare context is not available");
  }
  return cloudflare;
}
