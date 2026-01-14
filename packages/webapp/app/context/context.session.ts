import { createContext } from "react-router";
import type {
  ContextAndRequest,
  Session,
} from "~/utils.server/util.server.types";

export const sessionContext = createContext<Session>();

export function getSessionContext<T extends ContextAndRequest>({ context }: T) {
  const ctx = context.get(sessionContext);
  if (!ctx) throw new Error("Session context is not available");
  return ctx;
}
