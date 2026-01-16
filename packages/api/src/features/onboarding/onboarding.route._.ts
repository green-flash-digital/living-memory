import { Hono } from "hono";
import type { Route, SessionVars } from "../../utils/types.js";
import { getStatus } from "./onboarding.route.getStatus.js";
import { createHousehold } from "./onboarding.route.createHousehold.js";
import { joinHousehold } from "./onboarding.route.joinHousehold.js";
import { validateSlug } from "./onboarding.route.validateSlug.js";

export const onboarding = new Hono<Route<SessionVars>>()
  .route("/status", getStatus)
  .route("/validate-slug", validateSlug)
  .route("/create-household", createHousehold)
  .route("/join-household", joinHousehold);
