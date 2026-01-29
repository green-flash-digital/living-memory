import { type ClientFetchArgs } from "../../utils/ClientFetch.js";
import {
  CreateHouseholdRequestSchema,
  type CreateHouseholdRequest,
  type CreateHouseholdResponse
} from "./create-household/schema.js";
import { type ValidateSlugRequest, type ValidateSlugResponse } from "./validate-slug/schema.js";
import { type OnboardingGetStatusResponse } from "./get-status/schema.js";
import {
  SetOnboardingStepRequestSchema,
  type SetOnboardingStepRequest,
  type SetOnboardingStepResponse
} from "./set-step/schema.js";
import { ClientFetchSSR } from "../../utils/ClientFetchSSR.js";
import { ClientFetchBrowser } from "../../utils/ClientFetchBrowser.js";
import {
  ApproveDevicePairingRequestSchema,
  type ApproveDevicePairingRequest,
  DenyDevicePairingRequestSchema,
  type DenyDevicePairingRequest,
  type OnboardingPairDeviceApprovalResponse
} from "./pair-device/schema.js";
import {
  UpdateUserInfoRequestSchema,
  type UpdateUserInfoRequest,
  type UpdateUserInfoResponse
} from "./update-user-info/schema.js";

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

  updateUserInfo(body: UpdateUserInfoRequest, request: Request) {
    return this._mutate<UpdateUserInfoResponse>({
      method: "POST",
      path: "/user",
      body: [UpdateUserInfoRequestSchema, body],
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

  approveDevicePairing(body: ApproveDevicePairingRequest, request: Request) {
    return this._mutate<OnboardingPairDeviceApprovalResponse>({
      method: "POST",
      path: "/pair/approve",
      body: [ApproveDevicePairingRequestSchema, body],
      request
    });
  }

  denyDevicePairing(body: DenyDevicePairingRequest, request: Request) {
    return this._mutate<OnboardingPairDeviceApprovalResponse>({
      method: "POST",
      path: "/pair/deny",
      body: [DenyDevicePairingRequestSchema, body],
      request
    });
  }

  setStep(body: SetOnboardingStepRequest, request: Request) {
    return this._mutate<SetOnboardingStepResponse>({
      method: "POST",
      path: "/set-step",
      body: [SetOnboardingStepRequestSchema, body],
      request
    });
  }
}

export class OnboardingClientBrowser extends ClientFetchBrowser {
  constructor(args: ClientFetchArgs) {
    super({ baseURL: args.baseURL.concat("/api/onboarding") });
  }

  validateHouseholdSlug(params: ValidateSlugRequest) {
    return this._get<ValidateSlugResponse>({
      path: `/validate-slug/${params.slug}`
    });
  }
}
