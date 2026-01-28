import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { getStatus } from "./onboarding.route.getStatus.js";
import { createHousehold } from "./onboarding.route.createHousehold.js";
import { joinHousehold } from "./onboarding.route.joinHousehold.js";
import { validateSlug } from "./onboarding.route.validateSlug.js";
import { pairDevice } from "./onboarding.route.pairDevice.js";
import { setStep } from "./onboarding.route.setStep.js";
import { updateUserInfo } from "./onboarding.route.updateUserInfo.js";

export const onboarding = new Hono<Route<SessionVars>>()
  .route("/status", getStatus)
  .route("/validate-slug", validateSlug)
  .route("/user", updateUserInfo)
  .route("/create-household", createHousehold)
  .route("/join-household", joinHousehold)
  .route("/set-step", setStep)
  .route("/pair", pairDevice);
