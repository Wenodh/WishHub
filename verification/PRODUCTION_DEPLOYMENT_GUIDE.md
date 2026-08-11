# Production Deployment Guide

## 1. Context
This deployment guide outlines the structural prerequisites and steps to deploy WishHub to Vercel and Neon in a production environment.

---

## 2. Infrastructure Setup

### A. Neon PostgreSQL Databases
1. Create a new Neon project in your desired region.
2. In the Database Dashboard, copy the Connection Pooler connection strings:
   - **Pooled Mode**: Use this connection string for `DATABASE_URL`.
   - **Direct Mode**: Use this connection string for `DIRECT_URL`.

### B. Vercel Web Portal Deployment
1. Import the repository into your Vercel Dashboard.
2. Set the root directory of the project as `/` (turborepo root).
3. Select the Framework Preset as **Next.js**.
4. Configure the environment variables in Vercel as shown below.

---

## 3. Required Environment Variables

```env
# Relational DB Connectors
DATABASE_URL="postgresql://postgres:[password]@ep-soft-shadow-a2b1c3.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://postgres:[password]@ep-soft-shadow-a2b1c3-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Better Auth Parameters
BETTER_AUTH_SECRET="[secure-random-salt]"
BETTER_AUTH_URL="https://wishhub.com"

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
