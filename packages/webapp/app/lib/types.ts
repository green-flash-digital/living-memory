import type { RouterContextProvider } from "react-router";

export type ContextAndRequest = {
  context: Readonly<RouterContextProvider>;
  request: Request;
};
