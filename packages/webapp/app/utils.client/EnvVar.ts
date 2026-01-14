type EnvVarKeys = keyof Pick<
  Cloudflare.Env,
  "API_DOMAIN" | "LIVING_MEMORY_ENV"
>;

declare global {
  interface Window {
    __ENV__: { [key in EnvVarKeys]: string };
  }
}

type EnvVars = { [key in EnvVarKeys]: string };

export class EnvVarManager {
  vars: EnvVars = {
    API_DOMAIN: "",
    LIVING_MEMORY_ENV: "",
  };
  constructor() {}

  register(obj: EnvVars) {
    this.vars = obj;
  }

  setWindowString(vars: EnvVars) {
    return `window.__ENV__ = ${JSON.stringify(vars)};`;
  }

  get(varKey: EnvVarKeys) {
    // Client-side: use window.__ENV__ set by root loader
    if (typeof window !== "undefined") {
      const key = window.__ENV__?.[varKey];
      if (!key) {
        throw new Error(
          `Missing environment variable "${varKey}". Please ensure it's set at the root loader.`
        );
      }
      return key;
    }

    // Server-side: first check registered vars (from loader)
    if (this.vars[varKey]) {
      return this.vars[varKey];
    }

    // Fallback to process.env if available (for local dev/testing)
    // @ts-expect-error - process may not exist in Cloudflare Workers
    if (typeof process !== "undefined" && process.env?.[varKey]) {
      // @ts-expect-error - process may not exist in Cloudflare Workers
      return process.env[varKey];
    }

    throw new Error(
      `Missing environment variable "${varKey}". Please ensure it's registered via EnvVar.register() in your loader or set in process.env.`
    );
  }
}

export const ClientEnvVar = new EnvVarManager();
