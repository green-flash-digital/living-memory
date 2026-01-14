export function getEnvVar(envKey: keyof Cloudflare.Env) {
  try {
    return process.env[envKey];
  } catch (error) {
    throw new Error(`Cannot locate environment variable for "${envKey}"`);
  }
}
