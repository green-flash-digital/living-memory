import { auth } from "./auth";

export class MemoriesAPIClientServer {
  auth: typeof auth;

  constructor(_args: { apiDomain: string }) {
    this.auth = auth;
  }

  /**
   * Gets the current session from the auth API.
   * Returns null if no valid session exists.
   */
  // async getSession<T extends ContextAndRequest>(args: T) {
  //   return this.#fetch<Session | null>("/get-session", {
  //     headers: args.request.headers,
  //   });
  // }
}
