import type { RouterContextProvider } from "react-router";
import type { ApiClientSSR } from "./ApiClient.ssr";

export type ContextAndRequest = {
  context: Readonly<RouterContextProvider>;
  request: Request;
};

export type Session = typeof ApiClientSSR.auth.raw.$Infer.Session;
