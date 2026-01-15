import type { RouterContextProvider } from "react-router";
import type { ApiClientServer } from "./ApiClient.server";

export type ContextAndRequest = {
  context: Readonly<RouterContextProvider>;
  request: Request;
};

export type Session = typeof ApiClientServer.auth.raw.$Infer.Session;
