import { Hono } from "hono";
import { Route, SessionVars } from "../../utils/types";
import { getStatus } from "./onboarding.route.getStatus";
import { createHousehold } from "./onboarding.route.createHousehold";
import { joinHousehold } from "./onboarding.route.joinHousehold";
import { validateSlug } from "./onboarding.route.validateSlug";

export const onboarding = new Hono<Route<SessionVars>>()
  .route("/status", getStatus)
  .route("/validate-slug", validateSlug)
  .route("/create-household", createHousehold)
  .route("/join-household", joinHousehold);
