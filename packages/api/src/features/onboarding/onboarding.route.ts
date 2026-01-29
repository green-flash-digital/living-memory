import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { getStatus } from "./get-status/route.js";
import { createHousehold } from "./create-household/route.js";
import { joinHousehold } from "./join-household/route.js";
import { validateSlug } from "./validate-slug/route.js";
import { pairDevice } from "./pair-device/route.js";
import { setStep } from "./set-step/route.js";
import { updateUserInfo } from "./update-user-info/route.js";

export const onboarding = new Hono<Route<SessionVars>>()
  .route("/status", getStatus)
  .route("/validate-slug", validateSlug)
  .route("/user", updateUserInfo)
  .route("/create-household", createHousehold)
  .route("/join-household", joinHousehold)
  .route("/set-step", setStep)
  .route("/pair", pairDevice);

