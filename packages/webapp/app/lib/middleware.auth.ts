import { redirect } from "react-router";
import { getCFContext } from "./context.cloudflare";
import { sessionContext, type SessionContext } from "./context.session";
import type { ContextAndRequest } from "./types";

export async function requireSession<T extends ContextAndRequest>(args: T) {
  const cf = await getCFContext(args);

  console.log(args.request.headers);

  const url = `${cf.env.API_DOMAIN}/api/auth/get-session`;
  const res = await fetch(url, {
    headers: args.request.headers,
    credentials: "include",
  });
  console.log(res);

  if (!res.ok) {
    throw redirect("/sign-in");
  }

  const session = (await res.json()) as SessionContext;
  console.log(session);
  if (!session || !session.session) {
    throw redirect("/sign-in");
  }

  // // Set the session data in context
  // // The session data structure from better-auth API
  args.context.set(sessionContext, session);
}
