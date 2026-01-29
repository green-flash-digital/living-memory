import { type ClientFetchArgs } from "../../utils/ClientFetch.js";
import { ClientFetchSSR } from "../../utils/ClientFetchSSR.js";
import { ClientFetchBrowser } from "../../utils/ClientFetchBrowser.js";
import type { GetPlaylistListResponse } from "./getList/schema.js";
import type { GetPlaylistPhotosResponse } from "./getPhotos/schema.js";
import type { GetSinglePlaylistResponse } from "./getSingle/schema.js";
import {
  CreatePlaylistRequestSchema,
  type CreatePlaylistRequest,
  type CreatePlaylistResponse
} from "./create/schema.js";
import type { DeletePlaylistResponse } from "./delete/schema.js";

export class PlaylistsClient extends ClientFetchSSR {
  constructor(args: ClientFetchArgs) {
    super({ baseURL: args.baseURL.concat("/api/playlist") });
  }

  getList(request: Request) {
    return this._get<GetPlaylistListResponse>({
      path: "",
      request
    });
  }

  getSingle(id: string, request: Request) {
    return this._get<GetSinglePlaylistResponse>({
      path: `/${id}`,
      request
    });
  }

  getPhotos(id: string, request: Request) {
    return this._get<GetPlaylistPhotosResponse>({
      path: `/${id}/photos`,
      request
    });
  }

  create(body: CreatePlaylistRequest, request: Request) {
    return this._mutate<CreatePlaylistResponse>({
      method: "POST",
      path: "",
      body: [CreatePlaylistRequestSchema, body],
      request
    });
  }

  delete(id: string, request: Request) {
    return this._mutate<DeletePlaylistResponse>({
      method: "DELETE",
      path: `/${id}`,
      request
    });
  }
}

export class PlaylistsClientBrowser extends ClientFetchBrowser {
  constructor(args: ClientFetchArgs) {
    super({ baseURL: args.baseURL.concat("/api/playlist") });
  }

  getList() {
    return this._get<GetPlaylistListResponse>({
      path: ""
    });
  }

  getSingle(id: string) {
    return this._get<GetSinglePlaylistResponse>({
      path: `/${id}`
    });
  }

  getPhotos(id: string) {
    return this._get<GetPlaylistPhotosResponse>({
      path: `/${id}/photos`
    });
  }

  create(body: CreatePlaylistRequest) {
    return this._mutate<CreatePlaylistResponse>({
      method: "POST",
      path: "",
      body: [CreatePlaylistRequestSchema, body]
    });
  }

  delete(id: string) {
    return this._mutate<DeletePlaylistResponse>({
      method: "DELETE",
      path: `/${id}`
    });
  }
}

