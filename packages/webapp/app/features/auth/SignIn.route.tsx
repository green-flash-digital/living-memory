import { useState, type FormEvent } from "react";
import { redirect, useNavigate } from "react-router";
import type { Route } from "./+types/SignIn.route";

import { ApiClientBrowser } from "~/utils.client/ApiClient.browser";
import { ApiClientServer } from "~/utils.server/ApiClient.server";

export async function loader(args: Route.LoaderArgs) {
  const session = await ApiClientServer.auth.api.getSession(args.request);
  if (session?.session) throw redirect("/");
  return null;
}

export default function SignInRoute() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await ApiClientBrowser.auth.signIn.email({
        email,
        password,
      });
      // Better Auth automatically sets the cookie, so we can redirect
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              backgroundColor: "#fee",
              color: "#c33",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.75rem",
            fontSize: "1rem",
            backgroundColor: isLoading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
