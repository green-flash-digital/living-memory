import { Hono } from "hono";
import type { Route, SessionVars } from "../../../utils/types.js";
import { zValidator } from "@hono/zod-validator";
import { HTTPError, tryHandle } from "@living-memory/utils";
import { eq } from "drizzle-orm";
import { schema } from "../../../db/index.js";
import { response } from "../../../utils/util.response.js";
import {
  ApproveDevicePairingRequestSchema,
  DenyDevicePairingRequestSchema,
  OnboardingPairDeviceApprovalResponseSchema
} from "./schema.js";

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

  await db
    .update(schema.user)
    .set({
      currentOnboardingStep: "COMPLETE",
      isOnboarded: true,
      updatedAt: new Date()
    })
    .where(eq(schema.user.id, user.id));

  return response.json(c, {
    schema: OnboardingPairDeviceApprovalResponseSchema,
    data: { message: "Device approved" },
    context: "onboarding.pairDevice.approve"
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

  return response.json(c, {
    schema: OnboardingPairDeviceApprovalResponseSchema,
    data: { message: "Device denied" },
    context: "onboarding.pairDevice.deny"
  });
});
