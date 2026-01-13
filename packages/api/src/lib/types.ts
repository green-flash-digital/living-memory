import { ContextVariablesAuth } from "./auth";

export type LMBindings = Cloudflare.Env;
export type LMVariables = ContextVariablesAuth;

export type LivingMemoryAPIContext = {
  Bindings: LMBindings;
  Variables: LMVariables;
};
