# Architecture Gap Report: Current → Target

This report details the successful architectural migration of WishHub from a self-managed authentication model to a unified cloud-native Neon infrastructure.

---

## 1. Current vs. Target Architecture

### Current State (Before Migration)
- **Auth Provider**: Self-managed Better Auth (running inside the Next.js process) as a legacy setup.
- **Session DB Storage**: Shared public database tables (`Session`, `Account`, `Verification`) managed via standard Prisma models.
- **Session Verification**: Required manual database lookups or database client queries on every single HTTP API call.
- **Data Boundary**: Identity schema and application tables were mixed in the public schema of the database.

### Target State (Completed)
- **Auth Provider**: Managed **Neon Auth** (cloud-integrated, managed entirely by Neon) via `@neondatabase/auth`.
- **Session DB Storage**: Isolated identity schemas handled securely by Neon's platform.
- **Session Verification**: Cryptographic signature checks on secure cookies, verified instantaneously via server components and API handlers via `auth.api.getSession()`.
- **Data Boundary**: Identity data stays securely in Neon Auth; WishHub application tables (User profile, Wishlist, SavedProduct, CatalogProduct) remain in the public schema, managed via Prisma. All obsolete models (`Session`, `Account`, `Verification`) have been completely removed from the Prisma schema.

---

## 2. Completed Actions & Enhancements

1. **Integrated `@neondatabase/auth` Server-Side Adapter**:
   - Programmed the `getSession()` wrapper inside `packages/auth/src/index.ts` to fetch cryptographically authenticated cookies.
   - Preserved backward compatibility with `withApiHandler` so that all protected REST endpoints (`/api/products`, `/api/wishlists`, etc.) work seamlessly.

2. **Removed Obsolete Better Auth Models from Prisma Schema**:
   - Pruned `Session`, `Account`, and `Verification` models from `packages/database/prisma/schema.prisma` and updated the relationships on `User`.
   - Re-generated the Prisma Client successfully.

3. **Central User Profile Synchronization**:
   - Configured `auth.api.getSession` to automatically upsert/sync user identities directly to the `public.User` profile table.
   - This eliminates foreign-key constraint violations on user-created models (`Wishlist`, `SavedProduct`).

4. **Enhanced Extension Auth Helper (SDK)**:
   - Refactored `CookieAuthProvider` in `packages/sdk/src/auth.ts` to accept `baseUrl` and append `{ credentials: 'include' }` on fetch calls to support secure cross-origin cookie sharing from the browser extension popup.

---

## 3. Verification & Evidence

- **Compilation**: Run `pnpm run typecheck` — 100% PASS across all packages in the workspace.
- **Lint**: Run `pnpm run lint` — 100% PASS with 0 errors.
- **Unit/Integration Tests**: Run `pnpm test` — 31/31 tests pass cleanly in the web application (including tests for product detail drawers, API handlers, insights, and wishlists).
- **Production Build**: Run `pnpm run build` — Turbopack compiles Next.js successfully and the Prisma client is generated before compiling.
- **Database Safety**: We successfully pruned legacy tables from our schema configuration, preparing it for deployment.
