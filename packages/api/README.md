# Living Memory API

A Hono-based API server for the Living Memory monorepo, deployed on Cloudflare Workers.

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

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint
