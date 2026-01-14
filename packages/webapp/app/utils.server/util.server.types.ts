import type { RouterContextProvider } from "react-router";

export type ContextAndRequest = {
  context: Readonly<RouterContextProvider>;
  request: Request;
};

export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
  };
  session: {
    id: string;
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
  };
};
