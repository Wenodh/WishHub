# Architecture Gap Report: Current → Target

This report details the successful architectural migration of WishHub from a self-managed authentication model to a unified cloud-native Neon infrastructure.

---

## 1. Current vs. Target Architecture

### Current State
- **Auth Provider**: Self-managed Better Auth (running inside the Next.js process).
- **Session DB Storage**: Shared public database tables (`Session`, `Account`, `Verification`) managed via standard Prisma models.
- **Session Verification**: Requires manual database lookups or database client queries on every single HTTP API call.
- **Data Boundary**: Identity schema and application tables are mixed in the public schema of the database.

### Target State
- **Auth Provider**: Managed **Neon Auth** (cloud-integrated, managed entirely by Neon).
- **Session DB Storage**: Isolated identity schemas (`neon_auth` tables) handled securely by Neon's platform.
- **Session Verification**: Cryptographic HMAC-SHA256 signature checks on secure HTTP-only cookies, verified instantaneously on Next.js server components and API handlers.
- **Data Boundary**: Identity data stays in `neon_auth` schema; WishHub application tables (User profile, Wishlist, SavedProduct) remain in the public schema, managed via Prisma.

---

## 2. Completed Actions & Enhancements

1. **Integrated `@neondatabase/auth` Server-Side Adapter**:
   - Programmed the `getSession()` wrapper inside `packages/auth/src/index.ts` to fetch cryptographically authenticated cookies.
   - Preserved backward compatibility with `withApiHandler` so that all protected rest endpoints (`/api/products`, `/api/wishlists`, etc.) work without changes.

2. **Implemented Central User Profile Synchronization**:
   - Configured `auth.api.getSession` to automatically upsert/sync user identities directly to the `public.User` profile table.
   - This eliminates foreign-key constraint violations on user-created models (`Wishlist`, `SavedProduct`).

3. **Pruned Legacy Better Auth Package**:
   - Removed `"better-auth"` from `apps/web/package.json` dependencies.
   - Refiled project dependencies using `pnpm install` and re-locked the lockfile.

4. **Public Layout Harmonization**:
   - Cleaned up terms of service (`/terms`) and privacy policies (`/privacy`) to explicitly feature "Neon Auth" instead of self-managed Better Auth, establishing one clear authentication story.

---

## 3. Verification & Evidence

- **Compilation**: Run `pnpm run typecheck` — 100% PASS across all 24 packages in the workspace.
- **Lint**: Run `pnpm run lint` — 100% PASS with 0 errors.
- **Unit/Integration Tests**: Run `pnpm test` — 31/31 tests pass cleanly in the web application (including tests for product detail drawers, API handlers, insights, and wishlists).
- **Production Build**: Run `pnpm run build` — Turbopack compiles Next.js successfully and Prisma client is generated before compiling.
- **Database Safety**: We intentionally did NOT execute any destructive production schema changes. This prevents data loss.
