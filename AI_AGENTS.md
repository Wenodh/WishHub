# WishHub AI Coding Agent Guidelines (`AI_AGENTS.md`)

This document is the absolute single source of truth and authoritative operating manual for all AI coding agents and human engineers contributing to the WishHub repository.

It defines our core product direction, priority hierarchy, technical standards, testing criteria, and agent workflow instructions. Every AI agent must ingest and strictly adhere to this guide.

---

## CORE PRODUCT DIRECTION

WishHub V1 is a **Universal Wishlist application**, not an AI platform, scraping platform, or price-tracking platform.

The fundamental user journey must work reliably:

```text
User
 ↓
Authenticate (Neon Auth)
 ↓
Create/select wishlist
 ↓
Add something
 ├── Paste product URL
 ├── Add product manually (if scraping fails)
 └── Browser extension
 ↓
Product saved
 ↓
View wishlist
 ↓
Search / filter / sort
 ↓
Open product
 ↓
Edit / move / delete
```

Everything else is secondary.

---

## 1. AI AGENT OPERATING PRINCIPLES

Establish these as mandatory, non-negotiable rules.

### Rule 1 — Make the product work before making it sophisticated
Agents must prioritize:
1. Correctness
2. Complete user journeys
3. Data integrity
4. Security
5. Reliability
6. Performance
7. Accessibility
8. UX polish
9. Advanced architecture

### Rule 2 — No fake functionality
Never use fake prices, fake histories, or mock production data presented as real data.

### Rule 3 — Never block the core product on optional intelligence
WishHub must remain fully functional if AI, scraping, or optional background jobs fail. Users must always be able to save a product/link manually.

### Rule 4 — Prefer boring infrastructure
Use the simplest architecture that solves the current problem. Do not introduce microservices, Redis, Kafka, or complex event buses unless demonstrably required.

---

## 2. PRODUCT PRIORITY HIERARCHY

```text
P0 — Core Wishlist
    Authentication (Neon Auth)
    Wishlists (CRUD, Default list)
    Add product (URL & Manual override)
    View products
    Edit products
    Move products
    Delete products
    Search / Filter / Sort
    User data isolation / Security

P1 — Import Experience
    URL import
    Metadata extraction (OG, JSON-LD)
    Manual fallback (When scraping fails)
    Browser extension (Basic save)
    Duplicate detection

P2 — Product Intelligence
    AI insights (Optional/Asynchronous)
    Categorization
    Smart tagging

P3 — Price Intelligence (Deferred)
    Price snapshots
    Price history
    Price tracking
    Price alerts & Notifications
```

---

## 3. SOURCE-OF-TRUTH ARCHITECTURE

```text
User
 │
 └── Wishlist
       │
       └── WishlistItem
              │
              └── CatalogProduct
```

The exact repository schema is authoritative. Agents must inspect the current Prisma schema before proposing changes. Do not blindly recreate existing models.

---

## 4. AUTHENTICATION & USERS

**Neon Auth is the single authoritative authentication platform.**

### Unified Authentication & Database Architecture

The application uses **Neon PostgreSQL** as the single database for both authentication (managed under the `neon_auth` cloud schema) and application data.

```text
Next.js
   │
   ├── Neon Auth (Managed identity tables)
   │      │
   │      └── Neon PostgreSQL
   │             │
   └─────────────┴── Neon PostgreSQL (via Prisma)
                      │
                      ├── Public application tables (User, Wishlist, SavedProduct)
```

The following environment variables are required for a functioning authentication deployment (Neon Auth):
- `NEON_AUTH_BASE_URL`
- `NEON_AUTH_COOKIE_SECRET`
- `DATABASE_URL`

### User Synchronization & IDOR Prevention
1. **User Table Synchronization**: A centralized synchronization is implemented in `@wishhub/auth` during `auth.api.getSession()`. It automatically registers and updates the public schema `User` record from the Neon Auth cloud identity.
2. **Server-Side Identity**: Never trust client-provided `userId` parameters from request bodies or queries. Always resolve identity from the verified Neon Auth session via `auth.api.getSession()`.
3. **Strict Ownership Validation**: All mutations and reads must verify ownership on the target record (e.g. `SavedProduct.userId === session.user.id`).

---

## 5. DATABASE RULES & WORKFLOW

PostgreSQL hosted on Neon is the persistence layer. Prisma is used for application database access.

### Database Workflow Protocol
- **Development**: Use schema push (`pnpm db:push` / `prisma db push`) inside `packages/database` during local iterations. There is no `prisma/migrations` folder; schema push is our active development workflow.
- **Prisma Client Generation**: Client generation is required before running builds. Run `pnpm db:generate` to generate the client.
- **Zero-Downtime Schema Updates**: Never perform breaking database changes against production.
- **Better Auth Cleaned Up**: Legacy models (`Session`, `Account`, `Verification`) have been completely removed from the Prisma schema.

---

## 6. API RULES

All REST endpoints in `apps/web` must use shared helpers in `lib/api/responses.ts` to return consistent JSON:

#### Success Response (HTTP 200/201)
```json
{
  "success": true,
  "data": {
    "id": "clt123456",
    "name": "My Travel Gear"
  }
}
```

#### Failure Response (HTTP 400/401/403/404/500)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required to perform this action."
  }
}
```

---

## 7. BROWSER EXTENSION AUTHENTICATION

The browser extension uses `WishHubSDK(baseUrl)` and interacts with Neon Auth.
- **Session Verification**: The SDK implements `CookieAuthProvider`, querying `${baseUrl}/api/auth/get-session` with `credentials: 'include'`.
- **CORS & Cookies**: Cross-origin requests in browser extensions are restricted by browser security policies. To successfully share the web application's authentication cookies, the extension's `manifest.json` must declare the appropriate host permissions, and the backend must allow CORS requests from the extension's unique origin.

---

## 8. AGENT WORKFLOW & ANTI-PATTERNS

Before implementing anything, coding agents must follow this exact sequence:

1. **Step 1 — Discover**: Search for existing components/APIs/models before proposing new code.
2. **Step 2 — Understand**: Trace current implementation end-to-end.
3. **Step 3 — Reuse**: Reuse existing UI controls from `@wishhub/ui` and scraper normalizers.
4. **Step 4 — Implement**: Make the smallest coherent change.
5. **Step 5 — Verify**: Run relevant tests immediately (`pnpm test`).
6. **Step 6 — Inspect**: Check actual browser/API/DB behaviors.
7. **Step 7 — Document**: Update verification docs with evidence-backed results.

### Anti-patterns to Explicitly Avoid
- ❌ Creating duplicate Button/Input/Card components inside `apps/web/components` that duplicate `@wishhub/ui`.
- ❌ Hardcoding fake statistics or mock dashboard counters.
- ❌ Exposing stateful user routes without server-side ownership checks.
- ❌ Bypassing Zod schema validation in route endpoints.
- ❌ Direct DB client manipulation in API routes (always use a dedicated service/repository).
- ❌ Silently swallowing errors or returning uninformative error exceptions to users.
