import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareContext } from "../app/lib/context.cloudflare";

declare module "react-router" {
  // Migration support: allows existing code to access context.cloudflare
  // This is temporary and should be migrated to context.get(cloudflareContext)
  export interface RouterContextProvider {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const context = new RouterContextProvider();
    context.set(cloudflareContext, { env, ctx });
    // Migration support: also set on the context object directly
    // This allows existing code using context.cloudflare to continue working
    (context as any).cloudflare = { env, ctx };
    return requestHandler(request, context);
  },
} satisfies ExportedHandler<Env>;
