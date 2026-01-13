# Better Auth Setup Guide

This guide explains how to set up Better Auth authentication in the Living Memory monorepo.

## Overview

Better Auth is configured in two places:
1. **API Package** (`packages/api`) - Server-side auth handler
2. **Webapp Package** (`packages/webapp`) - Client-side auth integration

## API Setup

### 1. Environment Variables

Set the following in your Cloudflare Workers environment:

```bash
# Required: Neon PostgreSQL connection string
wrangler secret put DATABASE_URL

# Required: Secret for signing tokens
wrangler secret put BETTER_AUTH_SECRET

# Optional: Base URL (defaults to http://localhost:8787)
# Set in wrangler.jsonc vars or as environment variable
```

### 2. Neon Database Setup

Better Auth requires a database for storing users and sessions. We use Neon PostgreSQL with Prisma:

1. **Create a Neon account and database:**
   - Go to [neon.tech](https://neon.tech) and create an account
   - Create a new project and database
   - Copy your connection string (format: `postgresql://user:password@host/database?sslmode=require`)

2. **Set the connection string as a Wrangler secret:**
   ```bash
   wrangler secret put DATABASE_URL
   # Paste your Neon connection string when prompted
   ```

3. **For local development, create a `.env` file:**
   ```bash
   # packages/api/.env
   DATABASE_URL="your-neon-connection-string"
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:8787"
   ```

### 3. Database Setup with Prisma

1. **Generate Prisma Client:**
   ```bash
   cd packages/api
   yarn db:generate
   ```

2. **Run database migrations:**
   ```bash
   yarn db:migrate
   ```
   
   Or push the schema directly (for development):
   ```bash
   yarn db:push
   ```

   This will create all the necessary tables for Better Auth (User, Account, Session, VerificationToken).

## Webapp Setup

### 1. Environment Variables

Create `.env` or set in Cloudflare Pages:

```bash
VITE_API_URL=http://localhost:8787  # For local development
# In production, set to your API URL
```

### 2. Auth Client

The auth client is configured in `app/lib/auth.ts` (client-side) and `app/lib/auth.server.ts` (server-side).

## Usage

### Server-Side (React Router Loaders/Actions)

```typescript
import { authClient } from "../lib/auth.server";

export async function loader() {
  const session = await authClient.getSession();
  
  if (!session?.data?.session) {
    throw redirect("/login");
  }
  
  return { user: session.data.user };
}
```

### Client-Side (React Components)

```typescript
import { authClient } from "../lib/auth";

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
});

// Sign up
await authClient.signUp.email({
  email: "user@example.com",
  password: "password",
  name: "User Name",
});

// Sign out
await authClient.signOut();

// Get session
const session = await authClient.getSession();
```

## Routes

### API Routes (Automatic)

Better Auth automatically handles these routes at `/api/auth/*`:
- `POST /api/auth/sign-in/email` - Email/password login
- `POST /api/auth/sign-up/email` - Email/password registration
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session
- And more...

### Webapp Routes

- `/login` - Login page
- `/register` - Registration page
- `/logout` - Logout handler
- `/protected` - Example protected route

## Protecting Routes

### Server-Side Protection

```typescript
// In a route loader
export async function loader() {
  const session = await authClient.getSession();
  
  if (!session?.data?.session) {
    throw redirect("/login");
  }
  
  return { user: session.data.user };
}
```

### Client-Side Protection

```typescript
import { useAuth } from "better-auth/react";

function ProtectedComponent() {
  const { data: session } = useAuth();
  
  if (!session) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {session.user.email}!</div>;
}
```

## Development

1. Start the API:
   ```bash
   cd packages/api
   yarn dev
   ```

2. Start the webapp:
   ```bash
   cd packages/webapp
   yarn dev
   ```

3. Visit `http://localhost:5173` (or your webapp port)
4. Navigate to `/register` to create an account
5. Navigate to `/login` to sign in

## Production Deployment

1. **Set Secrets:**
   ```bash
   wrangler secret put DATABASE_URL
   wrangler secret put BETTER_AUTH_SECRET
   ```

2. **Configure Neon Database:**
   - Create database in Neon dashboard
   - Get connection string
   - Set as `DATABASE_URL` secret
   - Run migrations: `yarn db:migrate`

3. **Set Environment Variables:**
   - `BETTER_AUTH_URL` - Your production API URL
   - `VITE_API_URL` - Your production API URL (for webapp)

4. **Deploy:**
   ```bash
   # API
   cd packages/api && yarn deploy
   
   # Webapp
   cd packages/webapp && yarn deploy
   ```

## Troubleshooting

### "Database not found" or connection errors
- Ensure `DATABASE_URL` is set correctly as a Wrangler secret
- Verify your Neon connection string is valid
- Check that your Neon database is accessible (not paused)
- For local development, ensure `.env` file has `DATABASE_URL` set

### "Invalid secret" error
- Ensure `BETTER_AUTH_SECRET` is set as a Wrangler secret
- Use a strong random string (e.g., `openssl rand -base64 32`)

### CORS errors
- Ensure CORS is configured in API (`packages/api/src/index.ts`)
- Check that `credentials: true` is set in fetch options
- Verify API URL matches in both API and webapp configs

### Session not persisting
- Check that cookies are being set (HttpOnly, Secure, SameSite)
- Verify `credentials: "include"` in fetch options
- Ensure API URL is correct and accessible

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth Hono Integration](https://www.better-auth.com/docs/integrations/hono)
- [Better Auth Prisma Adapter](https://www.better-auth.com/docs/adapters/prisma)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with Neon](https://neon.tech/docs/guides/prisma)
