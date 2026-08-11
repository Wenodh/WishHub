# Neon Auth Migration Gap Assessment

## 1. Current Self-Managed Better Auth Architecture
- **Infrastructure**: Authentication service is self-managed and runs inside the Next.js process.
- **Data Flow**: Auth calls go directly to Next.js API routes (`/api/auth/[[...all]]`), which use `better-auth` and `better-auth/adapters/prisma` to write to the local PostgreSQL database tables (`User`, `Session`, `Account`, `Verification`).
- **Session Validation**: Server-side requests validate sessions by calling `auth.api.getSession({ headers })`, which queries the local database to verify sessions.
- **Client-Side**: Client components use `better-auth/react` to perform authentication operations (e.g. sign in, sign up, sign out).

## 2. Neon Auth Architecture
- **Infrastructure**: Managed Better Auth service hosted and fully managed by Neon.
- **Data Flow**: Authentication requests from the browser are proxied via `@neondatabase/auth` handlers to Neon Auth. Auth tables are managed securely by Neon in the `neon_auth` database schema.
- **Session Validation**: Server-side requests validate sessions using the official `@neondatabase/auth/next/server` SDK via HMAC-SHA256 signed session cookies, which automatically deduplicates and caches sessions to improve performance (subsequent hits are validated instantly without extra DB/API queries).
- **Client-Side**: Client components use the client-side module in `@neondatabase/auth/next` to handle login, registration, and logout.

## 3. Schema Differences
- **Legacy tables**: `Session`, `Account`, and `Verification` tables are managed directly by Neon Auth under the `neon_auth` schema.
- **Application schema**: The local `schema.prisma` retains the `User` model to consistently represent user profiles and enforce relationships (e.g., `Wishlist` and `SavedProduct` have foreign keys pointing to `User.id`).
- **Relationship**: The user identity (`id`, `email`, etc.) returned by Neon Auth is mapped cleanly to the `User` table, ensuring strict consistency.

## 4. Session Differences
- **Legacy**: Self-managed session validations require manual DB queries on every request.
- **Neon Auth**: Automatic session caching (60-second TTL) and cryptographic HMAC verification.

## 5. User Identity Mapping
- **Identity Fields**: Both systems expose identical `User` fields (`id`, `email`, `name`, `image`).
- **Consistency**: Neon Auth's authenticated `user.id` matches the user identity stored in the application database's `User` model, ensuring user isolation and ownership check consistency remain unchanged.

## 6. API Authorization Changes
- We maintain 100% backward compatibility by exporting an adapter in `@wishhub/auth` that implements `api.getSession` wrapping the new `auth.getSession()` call. This allows `withApiHandler` and unit/integration tests to function seamlessly without breaking.

## 7. Client-Side Changes
- In `apps/web/lib/api/auth-client.ts`, `createAuthClient` is imported from `@neondatabase/auth/next` instead of `better-auth/react`.

## 8. E2E Test Changes
- E2E testing/mocking remains completely intact because our server-side `auth` wrapper exports the exact same signature used by the test suites (`auth.api.getSession`).

## 9. Environment Changes
- Required environment variables:
  - `NEON_AUTH_BASE_URL`: Base URL of the Managed Neon Auth service.
  - `NEON_AUTH_COOKIE_SECRET`: Secret key of at least 32 characters used to sign and cache session cookies.
- Obsolete variables:
  - `BETTER_AUTH_SECRET`: Replaced by `NEON_AUTH_COOKIE_SECRET`.
  - `BETTER_AUTH_URL`: Handled automatically by the Neon Auth SDK proxy.

## 10. Files & Dependencies Safely Removed/Replaced
- `better-auth` package replaced with `@neondatabase/auth` in `@wishhub/auth` and client packages.
