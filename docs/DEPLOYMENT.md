# Deployment Guide

WishHub is designed to be easily deployable to modern cloud providers.

## Infrastructure Requirements

- **Database**: PostgreSQL (Supabase recommended)
- **Storage**: S3-compatible (Supabase Storage recommended)
- **Authentication**: Better Auth (Requires `BETTER_AUTH_SECRET`)

## Deployment Targets

### 1. Web & API (Vercel)
The web application and REST API are optimized for Vercel.
- **Root Directory**: `apps/web`
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`

### 2. Browser Extension
Built as a static artifact.
- **Root Directory**: `apps/extension`
- **Build Command**: `pnpm build`
- **Output**: `dist/` folder (Upload to Chrome Web Store / Firefox Add-ons)

## Environment Variables

See `.env.example` in the root directory for a full list of required variables.

### Critical Server Variables
- `DATABASE_URL`: Postgres connection string.
- `BETTER_AUTH_SECRET`: Random string for signing sessions.
- `BETTER_AUTH_URL`: Canonical URL of your deployment.

### Critical Client Variables
- `NEXT_PUBLIC_APP_URL`: URL of the web dashboard.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.

## Production Checklist

1. [ ] Run `pnpm db:push` to sync production schema.
2. [ ] Verify all environment variables are set in the deployment dashboard.
3. [ ] Perform a full build check locally with `pnpm build`.
4. [ ] Ensure `SKIP_ENV_VALIDATION` is NOT set to `true` in production.
