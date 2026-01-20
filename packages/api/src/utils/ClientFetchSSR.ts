import { z, type ZodType } from "zod";
import { ClientFetch, type ClientFetchArgs, type ClientFetchResult } from "./ClientFetch.js";

export class ClientFetchSSR extends ClientFetch {
  constructor(args: ClientFetchArgs) {
    super(args);
  }

  /**
   * SSR version requires Request object to copy headers from the incoming request.
   */
  protected _prepareHeaders(request?: Request): Headers {
    if (!request) {
      throw new Error("Request object is required for SSR client");
    }
    return this._makeHeaders(request);
  }

  /**
   * Override _get to require Request parameter for SSR.
   */
  protected async _get<T, Q extends ZodType = ZodType>({
    path,
    query,
    request
  }: {
    path: string;
    query?: [schema: Q, data: z.infer<Q> | undefined];
    request: Request; // Required for SSR
  }): Promise<ClientFetchResult<T>> {
    return super._get({ path, query, request });
  }

  /**
   * Override _mutate to require Request parameter for SSR.
   */
  protected async _mutate<R, B extends ZodType = ZodType, Q extends ZodType = ZodType>({
    path,
    method,
    body,
    query,
    request
  }: {
    path: string;
    method: "POST" | "PUT" | "PATCH" | "DELETE";
    body?: [schema: B, data: z.infer<B>] | FormData;
    query?: [schema: Q, data: z.infer<Q> | undefined];
    request: Request; // Required for SSR
  }): Promise<ClientFetchResult<R>> {
    return super._mutate({ path, method, body, query, request });
  }
}
