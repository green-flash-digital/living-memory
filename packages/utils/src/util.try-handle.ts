type TryHandleSuccess<T> = {
  success: true;
  data: T;
};

type TryHandleError = {
  success: false;
  error: Error;
};

type TryHandleResult<T> = TryHandleSuccess<T> | TryHandleError;

/**
 * Safely executes a promise and returns a discriminated union.
 *
 * @example
 * ```ts
 * const result = await safeFetch(apiClient.post(...));
 * if (result.success) {
 *   // TypeScript knows result.data is the inferred type here
 *   console.log(result.data);
 * } else {
 *   // TypeScript knows result.error is available here
 *   console.error(result.error);
 * }
 * ```
 */
export async function tryHandle<T>(
  promise: Promise<T>
): Promise<TryHandleResult<T>> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
