import { ClientFetch, ClientFetchArgs } from "../../utils/ClientFetch";
import z from "zod";
import { CreateHouseholdRequestSchema } from "./onboarding.route.createHousehold";
import {
  ValidateSlugRequestSchema,
  ValidateSlugResponseSchema,
} from "./onboarding.route.validateSlug";

export class OnboardingClient extends ClientFetch {
  constructor(args: ClientFetchArgs) {
    super({ baseURL: args.baseURL.concat("/onboarding") });
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
    return this._mutate({
      method: "POST",
      path: "/create-household",
      body: [CreateHouseholdRequestSchema, body],
      request,
    });
  }
}
