import { z, ZodError } from "zod";

/**
 * Zod schema for standardized error responses from the API.
 * Uses a discriminated union based on error_type for type safety.
 */
const ErrorResponseBase = z.object({
  status: z.number(),
  message: z.string(),
});

export const ErrorResponseSchema = z.discriminatedUnion("error_type", [
  ErrorResponseBase.extend({
    error_type: z.literal("unknown"),
  }),
  ErrorResponseBase.extend({
    error_type: z.literal("unauthenticated"),
  }),
  ErrorResponseBase.extend({
    error_type: z.literal("unauthorized"),
  }),
  ErrorResponseBase.extend({
    error_type: z.literal("method_not_allowed"),
  }),
  ErrorResponseBase.extend({
    error_type: z.literal("server_error"),
  }),
  ErrorResponseBase.extend({
    error_type: z.literal("not_found"),
  }),
  ErrorResponseBase.extend({
    error_type: z.literal("bad_request"),
  }),
  ErrorResponseBase.extend({
    error_type: z.literal("validation"),
    errors: z.record(z.string(), z.array(z.string())),
  }),
]);

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/**
 * Base error class for all API errors.
 * All API errors extend this class and include status codes and error types.
 */
export class ApiError<
  T extends ErrorResponse["error_type"] = ErrorResponse["error_type"],
> extends Error {
  readonly error_type: T;
  readonly status: number;
  readonly errors?: Record<string, string[]>;

  constructor(opts: {
    error_type: T;
    status: number;
    message: string;
    errors?: T extends "validation" ? Record<string, string[]> : never;
  }) {
    super(opts.message);
    this.name = this.constructor.name;
    this.error_type = opts.error_type;
    this.status = opts.status;

    if (opts.error_type === "validation" && opts.errors) {
      this.errors = opts.errors;
    }

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Converts the error to a standardized ErrorResponse JSON object.
   * This is used when sending errors as JSON responses from the API.
   */
  toJson(): ErrorResponse {
    const payload = {
      error_type: this.error_type,
      status: this.status,
      message: this.message,
      ...(this.error_type === "validation" && this.errors
        ? { errors: this.errors }
        : {}),
    };

    return ErrorResponseSchema.parse(payload);
  }
}

// Specific error classes for common HTTP error scenarios

export class ValidationError extends ApiError<"validation"> {
  constructor(errors: Record<string, string[]>, message = "Validation failed") {
    super({
      error_type: "validation",
      message,
      status: 400,
      errors,
    });
  }
}

export class BadRequestError extends ApiError<"bad_request"> {
  constructor(message = "Bad request") {
    super({
      error_type: "bad_request",
      message,
      status: 400,
    });
  }
}

export class UnauthenticatedError extends ApiError<"unauthenticated"> {
  constructor(message = "You need to sign in to access this resource.") {
    super({
      error_type: "unauthenticated",
      message,
      status: 401,
    });
  }
}

export class UnauthorizedError extends ApiError<"unauthorized"> {
  constructor(message = "Not authorized") {
    super({
      error_type: "unauthorized",
      message,
      status: 403,
    });
  }
}

export class NotFoundError extends ApiError<"not_found"> {
  constructor(message = "The requested resource does not exist") {
    super({
      error_type: "not_found",
      message,
      status: 404,
    });
  }
}

export class MethodNotAllowedError extends ApiError<"method_not_allowed"> {
  constructor(method: string) {
    super({
      error_type: "method_not_allowed",
      message: `"${method}" is not allowed.`,
      status: 405,
    });
  }
}

export class ServerError extends ApiError<"server_error"> {
  constructor(reason: string) {
    super({
      error_type: "server_error",
      message: `There was an internal server error: ${reason}`,
      status: 500,
    });
  }
}

export class UnknownError extends ApiError<"unknown"> {
  constructor(message = "An unknown error occurred", status = 500) {
    super({
      error_type: "unknown",
      message,
      status,
    });
  }
}

/**
 * Converts any thrown value into a typed ErrorResponse payload.
 *
 * This is intended to be used on the server, typically in an error handler
 * like `app.onError(...)`. It ensures that all responses follow a consistent,
 * JSON-serializable error format.
 *
 * - If the error is a `ZodError`, it wraps it in a validation error.
 * - If it's already an instance of `ApiError`, it serializes it as-is.
 * - If it's a raw object that matches the `ErrorResponseSchema`, it returns that directly.
 * - Otherwise, it falls back to a generic `unknown` error shape.
 *
 * @param error - Any unknown thrown value (typically from a `try/catch` block)
 * @returns A strongly typed `ErrorResponse` object for JSON serialization
 */
export function serializeError(error: unknown): ErrorResponse {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    });
    const validationError = new ValidationError(fieldErrors);
    return validationError.toJson();
  }

  if (error instanceof ApiError) {
    return error.toJson();
  }

  // Check if it's already a valid ErrorResponse shape
  if (typeof error === "object" && error !== null) {
    const parsed = ErrorResponseSchema.safeParse(error);
    if (parsed.success) {
      return parsed.data;
    }
  }

  // Fallback to unknown error
  return new UnknownError(
    error instanceof Error ? error.message : String(error)
  ).toJson();
}

/**
 * Converts a JSON error payload received from an API into an `ApiError` instance.
 *
 * **When to use:**
 * - Making direct `fetch()` calls (not using `ClientFetch`)
 * - Handling error responses from external APIs
 * - Working with error data from logs/monitoring services
 * - Implementing custom error handling/retry logic
 *
 * **When NOT to use:**
 * - With `ClientFetch` (it already handles deserialization automatically)
 * - When throwing errors directly (just use `new NotFoundError()` etc.)
 * - On the server side (use `serializeError()` instead)
 *
 * **What it does:**
 * - Converts a plain JSON error object into a typed `ApiError` class instance
 * - Enables `instanceof` checks (e.g., `error instanceof NotFoundError`)
 * - Provides type safety and proper error class hierarchy
 *
 * @param errorJson - The parsed JSON body from a failed fetch response, or an ErrorResponse object
 * @param method - Optional HTTP method (used for `method_not_allowed` errors)
 * @returns A structured `ApiError` instance that can be re-thrown or inspected
 *
 * @example
 * ```typescript
 * // Direct fetch call
 * const response = await fetch("/api/users/123");
 * if (!response.ok) {
 *   const errorJson = await response.json();
 *   const apiError = deserializeError(errorJson, "GET");
 *   if (apiError instanceof NotFoundError) {
 *     // Handle 404
 *   }
 * }
 * ```
 */
export function deserializeError(
  errorJson: unknown,
  method?: string
): ApiError {
  // If it's already an ApiError, return it as-is
  if (errorJson instanceof ApiError) {
    return errorJson;
  }

  // Try to parse as ErrorResponse
  const parsed = ErrorResponseSchema.safeParse(errorJson);
  if (!parsed.success) {
    return new ServerError("Unknown error format received from server");
  }

  const error = parsed.data;

  // Create the appropriate error class based on error_type
  switch (error.error_type) {
    case "validation":
      return new ValidationError(error.errors, error.message);
    case "unauthenticated":
      return new UnauthenticatedError(error.message);
    case "unauthorized":
      return new UnauthorizedError(error.message);
    case "not_found":
      return new NotFoundError(error.message);
    case "method_not_allowed":
      return new MethodNotAllowedError(method || "UNKNOWN");
    case "bad_request":
      return new BadRequestError(error.message);
    case "server_error":
      return new ServerError(error.message);
    case "unknown":
    default:
      return new UnknownError(error.message);
  }
}
