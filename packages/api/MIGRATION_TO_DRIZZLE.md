# Migration from Prisma to Drizzle

## ✅ Completed

1. ✅ Installed Drizzle dependencies
2. ✅ Created Drizzle schema (`src/db/schema.ts`)
3. ✅ Created Drizzle database connection (`src/db/drizzle.ts`)
4. ✅ Updated Better Auth to use `drizzleAdapter`
5. ✅ Created new seed scripts (`drizzle/seed/`)
6. ✅ Updated route files to use Drizzle syntax

## 🔄 Next Steps

### 1. Install Dependencies

```bash
cd packages/api
yarn install
```

### 2. Generate Better Auth Schema

Better Auth CLI can generate the required schema tables:

```bash
yarn db:seed:better-auth
```

This will generate the Better Auth tables (user, session, account, verification) if they don't exist in your schema.

### 3. Create Initial Migration

```bash
yarn db:generate
```

This creates a migration file based on your Drizzle schema.

### 4. Apply Migration

**⚠️ IMPORTANT:** Before running migrations, ensure your database is backed up!

```bash
yarn db:migrate
```

Or if you want to push schema directly (for development):

```bash
yarn db:push
```

### 5. Test Seed Script

```bash
yarn db:seed
```

This should now work perfectly in Node.js without any WASM issues! 🎉

### 6. Update Remaining Files

Some files may still reference Prisma types. Search for:
- `from.*generated.*enums` → Update to `from "../../db/enums.js"`
- `OnboardingStep` imports → Update to use `../../db/enums.js`
- Any remaining Prisma Client usage

### 7. Remove Prisma (After Testing)

Once everything works:

```bash
# Remove Prisma packages
yarn remove @prisma/adapter-neon @prisma/adapter-pg @prisma/client prisma

# Remove Prisma files
rm -rf prisma/
rm -rf src/db/generated/
rm src/db/prisma-client.ts
```

## Key Differences: Prisma vs Drizzle

### Updates
- **Prisma:** `db.user.update({ where: { id }, data: {...} })`
- **Drizzle:** `db.update(schema.user).set({...}).where(eq(schema.user.id, id))`

### Finds
- **Prisma:** `db.user.findUnique({ where: { id } })`
- **Drizzle:** `db.select().from(schema.user).where(eq(schema.user.id, id)).limit(1)`

### Creates
- **Prisma:** `db.user.create({ data: {...} })`
- **Drizzle:** `db.insert(schema.user).values({...}).returning()`

### Joins
- **Prisma:** `include: { relation: true }`
- **Drizzle:** `.innerJoin()` or `.leftJoin()` with explicit select

## Benefits

✅ **No WASM issues** - Pure TypeScript/JavaScript  
✅ **Works in Node.js and Cloudflare Workers** - Same code everywhere  
✅ **Simpler configuration** - No runtime-specific settings  
✅ **Better edge support** - Designed for serverless/edge  
✅ **Smaller bundle size** - Lighter than Prisma  

## Troubleshooting

If you encounter issues:

1. **Better Auth schema mismatch:** Run `yarn db:seed:better-auth` to regenerate
2. **Type errors:** Ensure all imports use `../../db/enums.js` instead of generated enums
3. **Migration issues:** Check `drizzle.config.ts` has correct DATABASE_URL
