import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { schemaFor } from "../../utils/schemaFor.js";
import { HTTPError, tryHandle } from "@living-memory/utils";

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

export const pairDevice = new Hono<Route<SessionVars>>();

pairDevice.post("/approve", zValidator("json", ApproveDevicePairingRequestSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const betterAuth = c.get("betterAuth");
  const body = c.req.valid("json");

  const approveRes = await tryHandle(
    betterAuth.deviceApprove({ body: { userCode: body.user_code }, headers: c.req.raw.headers })
  );
  if (!approveRes.success) {
    console.error(approveRes.error);
    throw HTTPError.badRequest(
      approveRes.error.message || "There was an error when trying to approve the device."
    );
  }
  await db.user.update({
    data: { currentOnboardingStep: "PAIR_DEVICE", isOnboarded: true },
    where: { id: user.id }
  });
});

pairDevice.post("/deny", zValidator("json", DenyDevicePairingRequestSchema), async (c) => {
  const betterAuth = c.get("betterAuth");
  const body = c.req.valid("json");

  const denyRes = await tryHandle(
    betterAuth.deviceDeny({ body: { userCode: body.user_code }, headers: c.req.raw.headers })
  );
  if (!denyRes.success) {
    console.error(denyRes.error);
    throw HTTPError.badRequest(
      denyRes.error.message || "There was an error when trying to deny the device."
    );
  }
});
