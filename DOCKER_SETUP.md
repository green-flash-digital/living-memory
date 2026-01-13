# Docker Setup for Local Development

This guide explains how to use Docker Compose to run a local PostgreSQL database for development.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Quick Start

1. **Start the PostgreSQL database:**
   ```bash
   docker-compose up -d
   ```

2. **Verify the database is running:**
   ```bash
   docker-compose ps
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example env file
   cp .env.example packages/api/.env
   
   # Or manually create packages/api/.env with:
   DATABASE_URL="postgresql://livingmemory:livingmemory@localhost:5432/living_memory?sslmode=disable"
   BETTER_AUTH_SECRET="your-local-secret-key"
   BETTER_AUTH_URL="http://localhost:8787"
   ```

4. **Generate Prisma Client:**
   ```bash
   cd packages/api
   yarn db:generate
   ```

5. **Run database migrations:**
   ```bash
   yarn db:migrate
   ```

6. **Start your development servers:**
   ```bash
   # In packages/api
   yarn dev
   
   # In packages/webapp (separate terminal)
   yarn dev
   ```

## Docker Compose Commands

### Start the database
```bash
docker-compose up -d
```
The `-d` flag runs containers in detached mode (background).

### Stop the database
```bash
docker-compose down
```

### Stop and remove volumes (deletes all data)
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f postgres
```

### Check database status
```bash
docker-compose ps
```

### Access PostgreSQL directly
```bash
# Using docker exec
docker-compose exec postgres psql -U livingmemory -d living_memory

# Or using psql if installed locally
psql postgresql://livingmemory:livingmemory@localhost:5432/living_memory
```

## Database Configuration

The Docker Compose setup uses the following default configuration:

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `living_memory`
- **Username:** `livingmemory`
- **Password:** `livingmemory`

**⚠️ Warning:** These credentials are for local development only. Never use them in production!

## Connecting to the Database

### From your application

Use this connection string in your `packages/api/.env`:

```
DATABASE_URL="postgresql://livingmemory:livingmemory@localhost:5432/living_memory?sslmode=disable"
```

### Using Prisma Studio

View and edit your database data with Prisma Studio:

```bash
cd packages/api
yarn db:studio
```

This will open Prisma Studio at `http://localhost:5555`.

## Troubleshooting

### Port already in use

If port 5432 is already in use, you can change it in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Change 5433 to any available port
```

Then update your `DATABASE_URL` to use the new port:
```
DATABASE_URL="postgresql://livingmemory:livingmemory@localhost:5433/living_memory?sslmode=disable"
```

### Database connection errors

1. **Check if the container is running:**
   ```bash
   docker-compose ps
   ```

2. **Check container logs:**
   ```bash
   docker-compose logs postgres
   ```

3. **Verify the connection string** matches the Docker Compose configuration

4. **Wait for the database to be ready:**
   The healthcheck ensures the database is ready before accepting connections. If you see connection errors, wait a few seconds and try again.

### Reset the database

To completely reset the database (deletes all data):

```bash
docker-compose down -v
docker-compose up -d
cd packages/api
yarn db:migrate
```

## Switching Between Local and Neon

### For Local Development (Docker)
```bash
# In packages/api/.env
DATABASE_URL="postgresql://livingmemory:livingmemory@localhost:5432/living_memory?sslmode=disable"
```

### For Production/Neon
```bash
# Set as Wrangler secret
wrangler secret put DATABASE_URL
# Paste your Neon connection string
```

Or in `packages/api/.env`:
```bash
DATABASE_URL="postgresql://user:password@neon-host/database?sslmode=require"
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)
