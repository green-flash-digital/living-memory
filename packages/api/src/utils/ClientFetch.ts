import { tryHandle } from "@living-memory/utils";

export type ClientFetchArgs = { baseURL: string };

export class ClientFetch {
  protected _baseURL: string;

  constructor({ baseURL }: ClientFetchArgs) {
    this._baseURL = baseURL;
  }

  protected async _fetch<R>(endpoint: string, init: RequestInit): Promise<R> {
    const url = this._baseURL.concat(endpoint);
    const tRes = await tryHandle(fetch(url, init));
    if (!tRes.success) {
      // network or fetch error
      console.error(`Fetch failed for ${url}:`, tRes.error);
      throw new Error(`Network error while fetching ${url}`);
    }
    const { data: res } = tRes;

    if (!res.ok) {
      // failed request
      const resText = await res.text().catch(() => undefined);
      console.error(`Fetch failed with status ${res.status}:`, resText);
      throw new Error(
        `Failed request [${res.status}]: ${resText ?? res.statusText}`
      );
    }

    const tJson = await tryHandle<R>(res.json());
    if (!tJson.success) {
      // failed json parsing
      const resText = await res.clone().text();
      const { error } = tJson;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Failed to parse JSON from ${url}:`, resText ?? errorMsg);
      throw new Error(`Failed to parse JSON response from ${url}: ${errorMsg}`);
    }

    return tJson.data;
  }
}
