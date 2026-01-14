import { createContext } from "react-router";
import type { Session } from "~/utils.server/util.server.types";

export const sessionContext = createContext<Session>();
