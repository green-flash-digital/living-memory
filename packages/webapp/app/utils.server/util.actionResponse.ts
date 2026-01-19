import type { ClientFetchResult } from "@living-memories/api/client/ssr";
import { redirect, type href } from "react-router";

/**
 * Standardized action response utility.
 *
 * Ensures all actions return data in a consistent shape, making it easier to:
 * - Handle errors uniformly
 * - Extract validation errors
 * - Type action data correctly
 * - Optionally redirect on success (static or dynamic based on response data)
 *
 * @example
 * ```tsx
 * // Basic usage - return the result as-is
 * export async function action(args: Route.ActionArgs) {
 *   const result = await ApiClientSSR.someMethod(data, args.request);
 *   return actionResponse(result);
 * }
 *
 * // With static redirect on success
 * export async function action(args: Route.ActionArgs) {
 *   const result = await ApiClientSSR.someMethod(data, args.request);
 *   return actionResponse(result, {
 *     redirectOnSuccess: href("/success")
 *   });
 * }
 *
 * // With dynamic redirect using response data
 * export async function action(args: Route.ActionArgs) {
 *   const result = await ApiClientSSR.createHousehold(data, args.request);
 *   return actionResponse(result, {
 *     redirectOnSuccess: (data) => href(`/household/${data.id}`)
 *   });
 * }
 * ```
 */
export function actionResponse<T>(
  result: ClientFetchResult<T>,
  options?: {
    /**
     * If provided, will throw a redirect on success instead of returning the data.
     * Can be a static path or a function that receives the response data and returns a path.
     * Useful for form submissions that should navigate after success.
     *
     * @example
     * // Static redirect
     * redirectOnSuccess: href("/success")
     *
     * // Dynamic redirect using response data
     * redirectOnSuccess: (data) => href(`/household/${data.id}`)
     */
    redirectOnSuccess?: ReturnType<typeof href> | ((data: T) => ReturnType<typeof href>);
  }
): ClientFetchResult<T> | Response {
  // If there's an error, always return it (don't redirect)
  if (!result.success) {
    return result;
  }

  // If redirect is requested on success, throw redirect (React Router pattern)
  if (options?.redirectOnSuccess) {
    const redirectPath =
      typeof options.redirectOnSuccess === "function"
        ? options.redirectOnSuccess(result.data)
        : options.redirectOnSuccess;
    throw redirect(redirectPath);
  }

  // Otherwise, return the result as-is
  return result;
}
