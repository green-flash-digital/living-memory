import type { ErrorResponse } from "@living-memory/utils";

/**
 * Type guard to check if an object is a ClientFetchResult error response
 */
function isClientFetchError(data: unknown): data is { success: false; error: ErrorResponse } {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    data.success === false &&
    "error" in data &&
    typeof data.error === "object" &&
    data.error !== null &&
    "error_type" in data.error
  );
}

/**
 * Type guard to check if an object is a validation ErrorResponse
 */
function isValidationError(error: unknown): error is ErrorResponse & {
  error_type: "validation";
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "error_type" in error &&
    error.error_type === "validation" &&
    "fieldErrors" in error &&
    typeof error.fieldErrors === "object" &&
    error.fieldErrors !== null
  );
}

/**
 * Extracts field-level validation errors from action data returned by useActionData.
 *
 * Parses the response to extract validation errors and returns them in a format
 * that can be easily mapped to form inputs (e.g., `errors.name`, `errors.slug`).
 *
 * @param actionData - The data returned from useActionData hook
 * @returns An object mapping field names to their first error message, or null if no validation errors
 *
 * @example
 * ```tsx
 * const actionData = useActionData();
 * const errors = getValidationErrors(actionData);
 *
 * // Use in JSX
 * <input name="name" />
 * {errors?.name && <span className="error">{errors.name}</span>}
 *
 * <input name="slug" />
 * {errors?.slug && <span className="error">{errors.slug}</span>}
 * ```
 */
export function getValidationErrors(actionData: unknown): Record<string, string> | null {
  // Check if actionData exists and is an object
  if (!actionData || typeof actionData !== "object") {
    return null;
  }

  let validationError: (ErrorResponse & { error_type: "validation" }) | null = null;

  // Check if it's a ClientFetchResult error response
  if (isClientFetchError(actionData)) {
    if (isValidationError(actionData.error)) {
      validationError = actionData.error;
    }
  }
  // Check if it's directly an ErrorResponse (not wrapped in ClientFetchResult)
  else if (isValidationError(actionData)) {
    validationError = actionData;
  }

  // Extract field errors if we found a validation error
  if (validationError && validationError.fieldErrors) {
    const fieldErrors: Record<string, string> = {};

    Object.entries(validationError.fieldErrors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === "string") {
        fieldErrors[field] = messages[0];
      }
    });

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
  }

  return null;
}
