import { ClientFetch, type ClientFetchArgs } from "../../utils/ClientFetch";
import z from "zod";
import {
  CreateHouseholdRequestSchema,
  CreateHouseholdResponseSchema,
} from "./onboarding.route.createHousehold";
import {
  ValidateSlugRequestSchema,
  ValidateSlugResponseSchema,
} from "./onboarding.route.validateSlug";
import { OnboardingGetStatusResponseSchema } from "./onboarding.route.getStatus";

export class OnboardingClient extends ClientFetch {
  constructor(args: ClientFetchArgs) {
    super({ baseURL: args.baseURL.concat("/onboarding") });
  }

  getStatus(request: Request) {
    return this._get<z.infer<typeof OnboardingGetStatusResponseSchema>>({
      path: "/status",
      request,
    });
  }

  validateHouseholdSlug(
    params: z.infer<typeof ValidateSlugRequestSchema>,
    request: Request
  ) {
    return this._get<z.infer<typeof ValidateSlugResponseSchema>>({
      path: `/validate-slug${params.slug}`,
      request,
    });
  }

  createHousehold(
    body: z.infer<typeof CreateHouseholdRequestSchema>,
    request: Request
  ) {
    return this._mutate<z.infer<typeof CreateHouseholdResponseSchema>>({
      method: "POST",
      path: "/create-household",
      body: [CreateHouseholdRequestSchema, body],
      request,
    });
  }
}
