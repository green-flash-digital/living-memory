import z from "zod";
import { schemaFor } from "../../../utils/schemaFor.js";

export type ApproveDevicePairingRequest = { user_code: string };
export const ApproveDevicePairingRequestSchema = schemaFor<ApproveDevicePairingRequest>({
  user_code: z.string().length(8, { error: "User code must be 8 characters" })
});

export type DenyDevicePairingRequest = { user_code: string };
export const DenyDevicePairingRequestSchema = schemaFor<DenyDevicePairingRequest>({
  user_code: z.string().length(8, { error: "User code must be 8 characters" })
});

export type OnboardingPairDeviceApprovalResponse = { message: string };
export const OnboardingPairDeviceApprovalResponseSchema =
  schemaFor<OnboardingPairDeviceApprovalResponse>({
    message: z.string()
  });
