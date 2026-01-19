import { type ClientFetchArgs } from "../../utils/ClientFetch.js";
import {
  CreateHouseholdRequestSchema,
  CreateHouseholdResponseSchema,
  type CreateHouseholdRequest,
  type CreateHouseholdResponse
} from "./onboarding.route.createHousehold.js";
import {
  ValidateSlugRequestSchema,
  ValidateSlugResponseSchema,
  type ValidateSlugRequest,
  type ValidateSlugResponse
} from "./onboarding.route.validateSlug.js";
import {
  OnboardingGetStatusResponseSchema,
  type OnboardingGetStatusResponse
} from "./onboarding.route.getStatus.js";
import { ClientFetchSSR } from "../../utils/ClientFetchSSR.js";
import { ClientFetchBrowser } from "../../utils/ClientFetchBrowser.js";

export class OnboardingClient extends ClientFetchSSR {
  constructor(args: ClientFetchArgs) {
    super({ baseURL: args.baseURL.concat("/api/onboarding") });
  }

  getStatus(request: Request) {
    return this._get<OnboardingGetStatusResponse>({
      path: "/status",
      request
    });
  }

  validateHouseholdSlug(params: ValidateSlugRequest, request: Request) {
    return this._get<ValidateSlugResponse>({
      path: `/validate-slug/${params.slug}`,
      request
    });
  }

  createHousehold(body: CreateHouseholdRequest, request: Request) {
    return this._mutate<CreateHouseholdResponse>({
      method: "POST",
      path: "/create-household",
      body: [CreateHouseholdRequestSchema, body],
      request
    });
  }
}

export class OnboardingClientBrowser extends ClientFetchBrowser {
  constructor(args: ClientFetchArgs) {
    super({ baseURL: args.baseURL.concat("/api/onboarding") });
  }

  getStatus() {
    return this._get<OnboardingGetStatusResponse>({
      path: "/status"
    });
  }

  validateHouseholdSlug(params: ValidateSlugRequest) {
    return this._get<ValidateSlugResponse>({
      path: `/validate-slug/${params.slug}`
    });
  }

  createHousehold(body: CreateHouseholdRequest) {
    return this._mutate<CreateHouseholdResponse>({
      method: "POST",
      path: "/create-household",
      body: [CreateHouseholdRequestSchema, body]
    });
  }
}
