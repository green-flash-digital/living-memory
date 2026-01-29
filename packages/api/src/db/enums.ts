/**
 * Single source of truth for onboarding steps.
 *
 * - Used by Drizzle schema (`pgEnum`) to generate migrations
 * - Used by API/runtime code for comparisons and defaults
 * - Used by Zod schemas via `z.enum(ONBOARDING_STEP_VALUES)`
 */
export const ONBOARDING_STEP_VALUES = [
  "USER_INFO",
  "PICK_HOUSEHOLD_OPTION",
  "JOIN_HOUSEHOLD",
  "CREATE_HOUSEHOLD",
  "PAIR_DEVICE",
  "COMPLETE"
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEP_VALUES)[number];

/**
 * Enum-like runtime object so callsites can do `OnboardingStep.USER_INFO`.
 * (Preferred over TypeScript `enum` to avoid drift from DB values.)
 */
export const OnboardingStep = {
  USER_INFO: "USER_INFO",
  PICK_HOUSEHOLD_OPTION: "PICK_HOUSEHOLD_OPTION",
  JOIN_HOUSEHOLD: "JOIN_HOUSEHOLD",
  CREATE_HOUSEHOLD: "CREATE_HOUSEHOLD",
  PAIR_DEVICE: "PAIR_DEVICE",
  COMPLETE: "COMPLETE"
} as const;
