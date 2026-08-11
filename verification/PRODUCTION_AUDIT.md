# Production Audit Report

## 1. Environment Variables Audit & Classification

A complete audit of environment variables configured across the WishHub repository:

### Category A: Required Production
- `DATABASE_URL`: Connection string to Neon PostgreSQL with connection pooling.
- `DIRECT_URL`: Non-pooling direct connection string used by Prisma during migrations.
- `BETTER_AUTH_SECRET`: Mandatory cryptographic signature key for session validation. Must be at least 32 characters.
- `BETTER_AUTH_URL`: Canonical base URL of the active web application (e.g., `https://wishhub.com`).
- `NEXT_PUBLIC_APP_URL`: Canonical base URL utilized on client components.

### Category B: Required Development/Test
- `DATABASE_URL`: Local PostgreSQL connection string (`postgresql://postgres:postgres@localhost:5432/postgres`).
- `BETTER_AUTH_SECRET`: Development signing salt (e.g., `testsecretbetterauth1234567890`).
- `BETTER_AUTH_URL`: Local testing host (`http://localhost:3000`).
- `NEXT_PUBLIC_APP_URL`: Local client base URL (`http://localhost:3000`).

### Category C: Optional Capabilities
- `FEATURE_AI`: Determines whether synchronous AI Shopping Insights is enabled (`true`/`false`).
- `FEATURE_PRICE_TRACKING`: Toggles price snapshot engines (`true`/`false`).
- `FEATURE_NOTIFICATIONS`: Toggles push/alert integrations (`true`/`false`).
- `FEATURE_PUBLIC_WISHLISTS`: Enables sharable wishlist folders (`true`/`false`).
- `RESEND_API_KEY`: Key for email transactions.
- `STORAGE_BUCKET`: Storage bucket identifier.
- `FCM_PROJECT_ID`: Firebase project identifier.

### Category D: Obsolete Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Unused. Supabase Auth is deprecated.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Unused. Supabase Auth is deprecated.
- `SUPABASE_SERVICE_ROLE_KEY`: Unused. Supabase Auth is deprecated.

---

## 2. Build Warnings Classification & Resolution

### Harmless / Non-Blocking
1. `MODULE_TYPELESS_PACKAGE_JSON` warning:
   - *Description*: Warnings stating next.config.js is reparsing as ES Module.
   - *Impact*: Low. Represents a minor performance overhead during compilation, does not affect production execution.
2. `unexpected export *` warning regarding `@prisma/client`:
   - *Description*: Next.js Turbopack warning during compilation concerning CJS exports from `@prisma/client`.
   - *Impact*: Low. Handled gracefully by Turbopack build layers.

### recommended cleanup
1. Deprecated Next.js `middleware` convention:
   - *Description*: Recommendation to migrate from Next.js `middleware.ts` to `proxy` config if appropriate.
   - *Impact*: Currently does not affect runtime capabilities, but recommended for Next.js 17 alignment.

### Release Blocker
1. `You are using the default secret. Please set BETTER_AUTH_SECRET`:
   - *Description*: Better Auth initialization crashes if `BETTER_AUTH_SECRET` is unset or default when `NODE_ENV=production`.
   - *Resolution*: Enforced strictly. Vercel dashboard and environment layers must reject builds or initializations that do not provide a strong custom secret.

---

## 3. Production Risks & Mitigation Steps

1. **Prisma Client Sync Latency**:
   - *Risk*: Client discrepancies if schema additions are not generated in Vercel.
   - *Mitigation*: The `apps/web/package.json` build task explicitly commands `pnpm --filter @wishhub/database db:generate && next build` to guarantee fresh client bindings on every deploy.
2. **Neon Connection Limits**:
   - *Risk*: Connection pooling failures on dynamic routes under high traffic spikes.
   - *Mitigation*: Ensure `DATABASE_URL` targets Neon's pooled endpoint (`-pooler`) and limits standard client pool configurations.
