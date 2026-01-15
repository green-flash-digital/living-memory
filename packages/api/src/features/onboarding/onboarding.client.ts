import { ClientFetch, ClientFetchArgs } from "../../utils/ClientFetch";
import z from "zod";
import { CreateHouseholdRequestSchema } from "./onboarding.route.createHousehold";
import { ValidateSlugRequestSchema } from "./onboarding.route.validateSlug";

export class OnboardingClient extends ClientFetch {
  constructor(args: ClientFetchArgs) {
    super({ baseURL: args.baseURL.concat("/onboarding") });
  }

  validateHouseholdSlug(params: z.infer<typeof ValidateSlugRequestSchema>) {
    return this._get({
      path: `/validate-slug${params.slug}`,
      params: [ValidateSlugRequestSchema, params],
    });
  }

  createHousehold(body: z.infer<typeof CreateHouseholdRequestSchema>) {
    return this._mutate("/create-household", {
      method: "POST",
      body: [CreateHouseholdRequestSchema, body],
    });
  }
}
