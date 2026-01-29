import { MemoriesApiClientReact } from "@living-memories/api/client/react";
import { ClientEnvVar } from "~/utils/EnvVar";

export const ApiClientReact = new MemoriesApiClientReact({
  baseURL: ClientEnvVar.get("API_DOMAIN")
});
