import { auth } from "../auth";

export type LMEnvs = Cloudflare.Env;
export type LMBindings = LMEnvs;
export type LMVariables = ContextVariablesAuth;

export type ContextVariablesAuth = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

export type LivingMemoryAPIContext = {
  Bindings: LMBindings;
  Variables: LMVariables;
};
