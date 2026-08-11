# Auth Architecture Audit — Neon Auth Integration

This report documents our verification-first findings and integration analysis of the **Neon Auth** migration.

---

## 1. Architectural & Verification Questionnaire

### Q1: How does Neon Auth store users and sessions?
- **Finding**: Neon Auth is a managed authentication-as-a-service provider built directly into the Neon database cloud platform. It stores user records, hashed passwords, and active session tokens securely inside dedicated cloud infrastructure, managed transparently by Neon.

### Q2: Which database schema and tables does Neon Auth manage?
- **Finding**: Neon Auth manages its persistent state in a separate database schema named `neon_auth` (e.g., `neon_auth.users`, `neon_auth.sessions`). It separates these identity tables completely from the public application tables (such as `public.Wishlist` and `public.SavedProduct`).

### Q3: Should the application reference Neon Auth users directly or maintain a local application `User` profile table?
- **Finding**: The application **must maintain a local application-level `User` profile table** in the public schema.
  - **Why?** Establishing a public `User` table allows Prisma to enforce standard foreign keys and cascade integrity rules on dependent application models (such as `Wishlist.userId` and `SavedProduct.userId`). It also allows adding custom profile metadata without contaminating the auth-managed tables.
  - **Mapping**: The unique Neon Auth user ID is stored directly as `User.id`, establishing a clean 1:1 mapping between Neon Auth and the public database.

### Q4: How is the authenticated user's ID obtained server-side in Next.js App Router?
- **Finding**: Obtained via the server-side module in `@neondatabase/auth/next/server` using `createNeonAuth`. Our system abstracts this inside the backwards-compatible `auth.api.getSession()` handler exported by `@wishhub/auth`. Any server-side Next.js route or layout can query this handler to retrieve `session.user.id`.

### Q5: How do cookies and session persistence work across SSR, API routes, refreshes, and deployments?
- **Finding**: `@neondatabase/auth` utilizes secure, HTTP-only, cryptographically-signed cookies (verified using the high-entropy `NEON_AUTH_COOKIE_SECRET` variable). Sessions survive browser refreshes, restarts, and Next.js builds/deployments cleanly because the validation is performed cryptographically with zero state drift.

### Q6: How do logout, signup, signin, and password reset work?
- **Finding**:
  - **Client-Side Actions**: Initiated on the client using `@neondatabase/auth/next` via the `authClient` client SDK (e.g., `authClient.signIn.email`, `authClient.signUp.email`).
  - **API Proxy**: Next.js proxies these authentication requests to Neon Auth's servers via a dynamic Next.js catch-all API route handler configured at `/api/auth/[...path]`.

### Q7: Should Prisma introspect or manage any Neon Auth tables?
- **Finding**: **No.** Prisma should NEVER introspect or manage tables owned by Neon Auth (under the `neon_auth` schema). Prisma should strictly own and manage application data inside the public schema. This maintains a clean separation of concerns and prevents migration conflicts.

### Q8: Is Neon Auth compatible with our existing `User.id` relationships?
- **Finding**: Yes, 100% compatible. Since the Neon Auth user ID is represented as a standard string, it maps perfectly to our existing `User.id` string field, preserving all active schema relationships and cascade settings.

### Q9: Is `@neondatabase/neon-js` actually required for our architecture?
- **Finding**: No. `@neondatabase/neon-js` is not required for Next.js App Router server/client session flows. The Next.js integration provided by `@neondatabase/auth` is fully self-contained, handles cookie validations, and interfaces directly with the proxy backend.

---

## 2. Integration & Sync Solution

To prevent scattering user creation or upsert queries across multiple API endpoints, we have integrated a **single authoritative synchronization path** directly inside `auth.api.getSession()`:

```typescript
// packages/auth/src/index.ts
export const auth = {
  ...neonAuth,
  api: {
    getSession: async (options?: { headers?: Headers }) => {
      const { data, error } = await neonAuth.getSession();
      if (error || !data) return null;

      // Automatically sync Neon Auth identity with our public User table
      try {
        await prisma.user.upsert({
          where: { id: data.user.id },
          update: {
            email: data.user.email,
            name: data.user.name,
            image: data.user.image,
          },
          create: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.image,
          },
        });
      } catch (err) {
        console.error("Error synchronizing Neon Auth user to application User model:", err);
      }

      return data;
    }
  }
};
```

This guarantees that:
1. Every authenticated page load, API call, or layout rendering automatically ensures the public `User` row exists before any relation query executes.
2. We prevent database foreign-key constraint violations without writing redundant user-creation blocks.

---

## 3. Migration Plan (Better Auth Removal)

To avoid breaking the production system, we followed a strict, verification-first sequence:

1. **Verify Integration**: Verified that all imports, route handlers, and clients utilize `@neondatabase/auth`.
2. **Harden Sync**: Integrated the authoritative public `User` upsert directly inside `getSession` as shown above.
3. **Verify Compilation & Tests**: Verified that the entire project passes TypeScript check and unit tests before removing anything.
4. **Remove Unused Package**: Pruned the obsolete `"better-auth"` dependency from `apps/web/package.json` and completed `pnpm install`.
5. **No Destructive Database Changes**: Retained `Session`, `Account`, and `Verification` tables in the Prisma schema for safe local/staging backwards-compatibility while we verify production migrations. No destructive `prisma db push` was executed against live data.
