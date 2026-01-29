import type { AuthInstance } from "../auth.js";
import type { Database } from "../db/index.js";
import { z } from "zod";

export type LMEnvs = Cloudflare.Env;
export type LMBindings = LMEnvs;

export type SessionVars = {
  user: AuthInstance["$Infer"]["Session"]["user"];
  session: AuthInstance["$Infer"]["Session"]["session"];
  betterAuth: AuthInstance["api"];
  db: Database;
};

export type MaybeSessionVars = {
  user: AuthInstance["$Infer"]["Session"]["user"] | null;
  session: AuthInstance["$Infer"]["Session"]["session"] | null;
  betterAuth: AuthInstance["api"] | null;
  db: Database | null;
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
