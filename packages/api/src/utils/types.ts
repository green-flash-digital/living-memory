import type { auth } from "../auth.js";
import { prismaClient } from "../db/prisma-client.js";
import { z } from "zod";

export type LMEnvs = Cloudflare.Env;
export type LMBindings = LMEnvs;

export type SessionVars = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
  betterAuth: typeof auth.api;
  db: typeof prismaClient;
};

export type MaybeSessionVars = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
  betterAuth: typeof auth.api | null;
  db: typeof prismaClient | null;
};

export type Route<V extends Record<string, unknown> | undefined = undefined> = V extends undefined
  ? { Bindings: LMBindings }
  : {
      Bindings: LMBindings;
      Variables: V;
    };

export type Middleware<V extends Record<string, unknown>> = {
  Bindings: LMBindings;
  Variables: V;
};
