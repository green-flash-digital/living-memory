import { ContextVariablesAuth } from "./auth";

export type LMEnvs = Cloudflare.Env;
export type LMBindings = LMEnvs;
export type LMVariables = ContextVariablesAuth;

export type LivingMemoryAPIContext = {
  Bindings: LMBindings;
  Variables: LMVariables;
};
