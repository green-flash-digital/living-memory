import type { RouterContextProvider } from "react-router";
import type { MemoriesApiClientSSR } from "@living-memories/api/client/ssr";

export type ContextAndRequest = {
  context: Readonly<RouterContextProvider>;
  request: Request;
};

export type Session = MemoriesApiClientSSR["auth"]["raw"]["$Infer"]["Session"];
