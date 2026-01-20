import type { ClientFetchResult } from "@living-memories/api/client/ssr";
import { type ErrorResponse } from "@living-memory/utils";
import type { ActionFunctionArgs } from "react-router";
import { z, type ZodType } from "zod";

type ExtractFieldErrors<E> =
  E extends ReturnType<typeof z.flattenError>
    ? E["fieldErrors"] extends Record<string, string[]> | undefined
      ? E["fieldErrors"]
      : undefined
    : undefined;

export type ActionResponse<
  T,
  V extends Record<string, string[]> | undefined = Record<string, string[]> | undefined
> = {
  data: T | undefined;
  valError: V;
  error: ErrorResponse | undefined;
};

export const ssrResponse = {
  validationError: <E extends ReturnType<typeof z.flattenError> | undefined>(
    error: E
  ): ActionResponse<never, ExtractFieldErrors<E>> => {
    return {
      data: undefined,
      valError: (error?.fieldErrors ?? undefined) as ExtractFieldErrors<E>,
      error: undefined
    } as const;
  },
  error: <E extends ErrorResponse>(error: E): ActionResponse<never> =>
    ({
      data: undefined,
      valError: undefined,
      error
    }) as const,
  data: <T>(data: T): ActionResponse<T> =>
    ({
      data,
      valError: undefined,
      error: undefined
    }) as const,
  clientFetch: <T>(result: ClientFetchResult<T>): ActionResponse<T> => {
    if (result.success) {
      return {
        data: result.data,
        valError: undefined,
        error: undefined
      };
    }
    return {
      data: undefined,
      valError: undefined,
      error: result.error
    };
  }
};
