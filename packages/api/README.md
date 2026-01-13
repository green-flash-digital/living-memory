# Living Memory API

A Hono-based API server for the Living Memory monorepo, deployed on Cloudflare Workers with Better Auth authentication.

## Development

```bash
# Install dependencies (from root)
yarn install

# Run in development mode
yarn dev

# Build for production
yarn build

# Preview production build locally
yarn preview
```

## Deployment

```bash
# Deploy to Cloudflare Workers
yarn deploy
```

## Type Generation

For generating/synchronizing types based on your Worker configuration:

```bash
yarn cf-typegen
```

## Authentication

This API uses [Better Auth](https://www.better-auth.com) for authentication with Prisma and Neon PostgreSQL. Auth routes are available at `/api/auth/*`.

### Environment Variables

Set the following in your Cloudflare Workers environment:

- `DATABASE_URL` - Neon PostgreSQL connection string (required)
  - Format: `postgresql://user:password@host/database?sslmode=require`
  - Set as a secret: `wrangler secret put DATABASE_URL`
- `BETTER_AUTH_SECRET` - Secret key for Better Auth (required)
  - Generate with: `openssl rand -base64 32`
  - Set as a secret: `wrangler secret put BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` - Base URL for your API (defaults to `http://localhost:8787`)

### Setting Up Database

#### Option 1: Local Development (Docker)

For local development, use the included Docker Compose setup:

1. **Start the PostgreSQL database:**
   ```bash
   # From the root of the monorepo
   docker-compose up -d
   ```

2. **Create `.env` file in `packages/api`:**
   ```bash
   cp .env.local.example .env
   # Or manually create .env with:
   DATABASE_URL="postgresql://livingmemory:livingmemory@localhost:5432/living_memory?sslmode=disable"
   BETTER_AUTH_SECRET="your-local-secret-key"
   BETTER_AUTH_URL="http://localhost:8787"
   ```

3. **Generate Prisma Client and run migrations:**
   ```bash
   yarn db:generate
   yarn db:migrate
   ```

See [DOCKER_SETUP.md](../../DOCKER_SETUP.md) for more details.

#### Option 2: Neon Database (Production/Cloud)

1. Create a Neon account and database at [neon.tech](https://neon.tech)

2. Get your connection string from the Neon dashboard

3. Set it as a Wrangler secret:
   ```bash
   wrangler secret put DATABASE_URL
   # Paste your Neon connection string when prompted
   ```

4. Generate Prisma Client:
   ```bash
   yarn db:generate
   ```

5. Run database migrations:
   ```bash
   yarn db:migrate
   ```

   Or push the schema directly:
   ```bash
   yarn db:push
   ```

### API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint
- `GET/POST /api/auth/*` - Better Auth endpoints (handled automatically)

## Better Auth Features

- Email/Password authentication
- Session management
- User registration and login
- Protected routes support
- Prisma adapter with Neon PostgreSQL

For more information, see the [Better Auth documentation](https://www.better-auth.com/docs).