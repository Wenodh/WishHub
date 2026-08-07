# Production Deployment Guide

## 1. Context
This deployment guide outlines the structural prerequisites and steps to deploy WishHub to Vercel and Supabase in a production environment.

---

## 2. Infrastructure Setup

### A. Supabase PostgreSQL Databases
1. Create a new Supabase project in your desired region.
2. In the Database Settings, copy the Connection Pooler connection strings:
   - **Transaction Mode** (Port 6543): Use this connection string for `DATABASE_URL`.
   - **Session/Direct Mode** (Port 5432): Use this connection string for `DIRECT_URL`.

### B. Vercel Web Portal Deployment
1. Import the repository into your Vercel Dashboard.
2. Set the root directory of the project as `/` (turborepo root).
3. Select the Framework Preset as **Next.js**.
4. Configure the environment variables in Vercel as shown below.

---

## 3. Required Environment Variables

```env
# Relational DB Connectors
DATABASE_URL="postgresql://postgres:[password]@db.[supabase-project].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[supabase-project].supabase.co:5432/postgres"

# Better Auth Parameters
BETTER_AUTH_SECRET="[secure-random-salt]"
BETTER_AUTH_URL="https://wishhub.com"

# Supabase Storage Connectors
NEXT_PUBLIC_SUPABASE_URL="https://[supabase-project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role]"

# Storage Bucket
STORAGE_BUCKET="wishlists-bucket"

# Analytics & Monitoring
NEXT_PUBLIC_POSTHOG_KEY="[ph-key]"
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
```

---

## 4. Build and Compilation Hooks
The Vercel pipeline will trigger our cached compilation. The build hook in `apps/web/package.json` ensures that Prisma Client generation is prioritized before executing compilation to satisfy next.js routes:

```bash
pnpm --filter @wishhub/database db:generate && next build
```
This guarantees zero compilation errors or "Prisma Client not initialized" runtime crashes.
