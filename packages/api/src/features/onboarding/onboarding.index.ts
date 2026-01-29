export {
  CreateHouseholdRequestSchema,
  type CreateHouseholdRequest,
  CreateHouseholdResponseSchema,
  type CreateHouseholdResponse
} from "./create-household/schema.js";

export {
  ValidateSlugRequestSchema,
  type ValidateSlugRequest,
  ValidateSlugResponseSchema,
  type ValidateSlugResponse
} from "./validate-slug/schema.js";

export {
  OnboardingGetStatusResponseSchema,
  type OnboardingGetStatusResponse
} from "./get-status/schema.js";

export { type JoinHouseholdRequest, joinHouseholdSchema } from "./join-household/schema.js";
export {
  type ApproveDevicePairingRequest,
  ApproveDevicePairingRequestSchema,
  type OnboardingPairDeviceApprovalResponse,
  OnboardingPairDeviceApprovalResponseSchema
} from "./pair-device/schema.js";
export {
  type SetOnboardingStepRequest,
  SetOnboardingStepRequestSchema,
  type SetOnboardingStepResponse,
  SetOnboardingStepResponseSchema
} from "./set-step/schema.js";
export {
  type UpdateUserInfoRequest,
  UpdateUserInfoRequestSchema,
  type UpdateUserInfoResponse,
  UpdateUserInfoResponseSchema
} from "./update-user-info/schema.js";
