import { type ClientFetchArgs } from "../../utils/ClientFetch.js";
import { ClientFetchSSR } from "../../utils/ClientFetchSSR.js";
import type { DeleteHouseholdResponse } from "./household.route.deleteHousehold.js";
import type { GetHouseholdBySlugResponse } from "./household.route.getHousehold.js";

export class HouseholdClient extends ClientFetchSSR {
  constructor(args: ClientFetchArgs) {
    super({ baseURL: args.baseURL.concat("/api/household") });
  }

  /**
   * Deletes a household by its ID.
   */
  deleteHousehold(householdId: string, request: Request) {
    return this._mutate<DeleteHouseholdResponse>({
      method: "DELETE",
      path: `/delete/${householdId}`,
      request
    });
  }

  /**
   * Get's a household by a slug
   */
  getHousehold(slug: string, request: Request) {
    return this._get<GetHouseholdBySlugResponse>({
      path: `/${slug}`,
      request
    });
  }
}
