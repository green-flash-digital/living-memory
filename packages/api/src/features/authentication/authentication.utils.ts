import { BetterAuthClientOptions } from "better-auth/client";
import {
  inferAdditionalFields,
  organizationClient,
  inferOrgAdditionalFields,
  deviceAuthorizationClient,
} from "better-auth/client/plugins";
import { auth } from "../../auth";

export const betterAuthClientConfig: BetterAuthClientOptions = {
  plugins: [
    inferAdditionalFields<typeof auth>(),
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
    }),
    deviceAuthorizationClient(),
  ],
};
