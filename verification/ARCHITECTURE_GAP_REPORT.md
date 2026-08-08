# WishHub V1 Architecture Gap Report

This document identifies and analyzes the architectural, structural, and behavioral gaps between the current implementation of WishHub and the authoritative V1 target direction. It provides a concrete priority-ordered remediation roadmap (P0 through P3) to guide engineering efforts in turning WishHub V1 into a production-ready, highly reliable product.

---

## Executive Summary

WishHub was conceived as an intelligent wishlist, leading to early implementation of background jobs, token cost estimators, and AI-driven summary insights (P2/P3). However, the absolute core of the product (P0) requires total stability, absolute reliability, and a crystal-clear, non-speculative user journey:

$$\text{Landing} \rightarrow \text{Authentication} \rightarrow \text{Dashboard} \rightarrow \text{Wishlist CRUD} \rightarrow \text{Add Product (URL/Manual)} \rightarrow \text{Metadata Fallback} \rightarrow \text{Product CRUD} \rightarrow \text{E2E Certifications}$$

By prioritizing working, reliable product flows over over-engineered microservices, custom queues, or advanced AI schemas, we ensure WishHub is robust, scalable, and delightful to real users.

---

## 1. Authentication Gaps

### Current Architecture
- Uses **Better Auth** with standard relational tables (`Session`, `Account`, `Verification`) inside PostgreSQL via Prisma.
- Session authorization is handled inside Next.js App Router API handlers wrapped with `withApiHandler` that invokes `auth.api.getSession({ headers })`.
- Extension and React-based pages interface with the `/api/auth/get-session` endpoint and the Better Auth React SDK client (`apps/web/lib/api/auth-client.ts`).

### Target V1 Architecture
- **Supabase Auth** is mandated as the single, authoritative authentication and identity provider.
- All sessions must be verified against Supabase token/session cookies.
- Single database schema with standard Supabase Auth tables (`auth.users`) mapped to profile schemas.

### Gap Analysis & Risk
- **Dual Systems Risk**: Running Better Auth and Supabase Auth in parallel creates session fragmentation, authentication drift, and user-isolation bugs.
- **Database Drift**: Prisma models for `Session`, `Account`, and `Verification` are actively used. If Supabase is adopted, these models are obsolete and must be cleaned up to prevent schema clutter.

### Recommended Resolution (P0)
1. **Migrate Backend Wrapper**: Refactor `withApiHandler` (`apps/web/lib/api/handler.ts`) to verify session headers/cookies against `@supabase/supabase-js` or Supabase server client instead of `auth.api.getSession`.
2. **Standardize SDK Client**: Overwrite `apps/web/lib/api/auth-client.ts` to use Supabase client auth instead of Better Auth's React Client SDK.
3. **Database Cleanup**: Deprecate Prisma models `Session`, `Account`, and `Verification`. Establish a foreign key constraint linking the `User` table to Supabase's native `auth.users` schema.

---

## 2. Core Product-Flow & Database Gaps

### Current Schema & Data Model
The current database schema implements the following design:
- `User` $\rightarrow$ `SavedProduct` $\rightarrow$ `CatalogProduct`
- `User` $\rightarrow$ `Wishlist` $\rightarrow$ `WishlistItem` $\rightarrow$ `SavedProduct`

While logical and structured, there are minor gaps in schema execution:

### Identified Gaps
1. **Complexity in Double Mapping**: The relationship model requires first saving a `SavedProduct` (global item linked to user) and then mapping it to a `WishlistItem` within a `Wishlist` folder. While normalized, it introduces complex multi-step transaction steps for standard "Save to list" flows.
2. **No Soft Deletion**: If a user deletes a `SavedProduct` or `Wishlist`, records are cascade deleted. We lack standard soft-deletion filters (`deletedAt`), risking accidental user data loss.

### Recommended Resolution (P0/P1)
1. **Simplify Transaction Helpers**: Ensure transaction blocks in the service layer (`save-product.service.ts` or `wishlist.service.ts`) execute atomic, single-step operations that handle both `SavedProduct` creation and `WishlistItem` routing seamlessly.
2. **Preserve Relational Cascades**: Ensure cascade delete rules are safe so that deleting a folder (`Wishlist`) deletes `WishlistItem` maps but **never** cascade deletes the global `CatalogProduct` data, as other users may still refer to it.

---

## 3. Product Import & Metadata Scraping Gaps

### Current Architecture
- Scraper (`packages/scraper`) performs metadata parsing via standard web scraping tools.
- Product creation (`apps/web/app/api/products/route.ts`) handles incoming payload validation using Zod contracts.

### Identified Gaps
1. **Scraping as a Hard Block**: If scraping fails or is blocked by third-party CAPTCHAs, the front-end lacks a robust manual override form that allows the user to simply input title, url, price, and image to bypass automatic scraper failures.
2. **Unvalidated Fallbacks**: If certain metadata (like brand, description, or image) is missing, the scraper has sometimes returned mock placeholders rather than keeping fields optional or letting users complete the missing details.

### Recommended Resolution (P1)
1. **Implement Manual Form Override**: Refactor the web/extension product add drawer/dialog. If the API returns a failed scrape or fallback status, immediately switch UI context to a simple manual input form:
   - Required: Title, URL.
   - Optional: Price, Currency, Image, Notes.
2. **Sanitize Output & Strip Mocks**: Strictly forbid mock placeholder strings (e.g. "Mock Brand", "₹9,999") on extraction failure. The DB schema supports nullable fields; let them remain `null` until the user supplies them.

---

## 4. UI/UX & Visual Gaps

### Current Style
- Designed with Geist variables, Tailwind configurations, and custom visual classes like `.premium-glass` and `.premium-shadow`.

### Identified Gaps
1. **Over-engineered Dashboards**: The active dashboard currently contains static representations of statistics that are not fully supported by real, live, and validated background data.
2. **Missing Granular Error States**: On network failures or unauthorized folder queries, some pages display generic gray backgrounds rather than contextual retry triggers.

### Recommended Resolution (P0/P1)
1. **Prune Fake Stats**: Replace hardcoded/fake dashboard widgets (e.g. "Price drop alert counters") with real data (e.g. total wishlists count, total saved item counts). If zero, present beautiful, Radix-compliant empty states with action triggers.
2. **Provide Actionable Loading boundaries**: Introduce distinct Tailwind skeleton placeholders (`@wishhub/ui/Skeleton`) on lazy-loaded drawers.

---

## 5. Browser Extension Gaps

### Current Extension Architecture
- Built on Vite + Tailwind CSS. Single popup connected to a background script managing a local cache.

### Identified Gaps
1. **Sync Conflicts**: If the user renames a wishlist on the web application, the cached lists in the extension (`chrome.storage.local`) can sometimes show stale titles for up to 5 minutes due to the rigid TTL configuration.
2. **Offline Flow Feedback**: While a background retry queue exists, there is a lack of prominent, visible alerts in the popup telling the user they are currently working in offline-retry mode.

### Recommended Resolution (P1)
1. **Bypass Cache on Force-Refresh**: Add a subtle refresh icon inside the extension popup folder selector to immediately invalidate the storage cache and trigger a live fetch of active wishlists.
2. **Offline Badge UI**: Inject a small `.premium-glass` banner reading "Working offline — items queued" in the popup header if standard network connectivity is lost.

---

## 6. Testing & E2E Coverage Gaps

### Current Suite
- Features Playwright E2E tests (`apps/web/e2e/product-flow.spec.ts`) and Vitest unit tests.

### Identified Gaps
1. **Supabase Mocking**: The active E2E suites assume Better Auth email validation. They lack mocked Supabase Client context flows.
2. **No Manual Fallback Test**: Existing E2E specs check success extraction flows, but do not assert that the application gracefully degrades to manual form submission when scraping fails.

### Recommended Resolution (P0)
1. **Adopt Supabase E2E Helpers**: Rewrite auth assertions in the Playwright suite to leverage standard Supabase session injection.
2. **Write Scraper Failure E2E Spec**: Add a specific E2E test block asserting that when a URL fetch fails (mocked with an invalid URL like `https://broken-website-test-fail.com`), a manual form appears, allows input, and saves the item successfully.

---

## 7. Over-engineered & Deprecated Features to Defer/Remove

To prevent architectural drift and accelerate a stable V1 release, the following features should be disabled, simplified, or fully deferred to post-V1:

| Feature Name | Current State | Target Action for V1 |
| :--- | :--- | :--- |
| **Price Tracking Scheduler (ADR 004)** | Partially implemented dispatcher, job cron runner, and database tables (`AIJob`, `PriceSnapshot`). | **Freeze/Defer**: Disable automatic cron triggers. Keep DB tables intact but do not run scheduled background loops that consume server resources unnecessarily until the core user flow is certified. |
| **AI Insights Queue** | Standard automatic background prompt queuing (`AIJob`). | **De-prioritize**: Simplify AI insights to be strictly on-demand (e.g. a "Regenerate Insight" button on the drawer) or disable entirely if OpenAI secrets are absent. |
| **Realtime Infrastructure** | Workspace `@wishhub/realtime` exists. | **Remove/Disable**: Do not load or mount WebSockets or real-time event listeners. Standard REST querying with TanStack Query is sufficient and highly robust. |
| **Distributed Queue Systems** | Placeholders for distributed job workers. | **Eliminate**: Use basic standard database-driven task queries or avoid queues entirely for V1. |

---

## 8. Prioritized V1 Action Plan

We recommend solving these gaps in exact sequential phases:

```text
Phase 1: Deep Audit & Freeze [COMPLETED]
   └── Audit schema, authentication systems, and testing boundaries.

Phase 2: Authentication Migration (P0)
   ├── Deprecate Better Auth from apps/web and apps/extension.
   ├── Set up Supabase Auth client helpers in SDK, extension, and app routes.
   └── Update prisma/schema.prisma to map Profiles directly to Supabase auth users.

Phase 3: Robust Metadata Fallback Form (P1)
   ├── Edit scraper logic to cleanly fail on invalid URLs without throwing raw system errors.
   └── Create responsive "Manual Override form" on Web and Extension popup.

Phase 4: Empty State & UI Polish (P0/P1)
   ├── Eliminate mock statistical counters on dashboard.
   └── Replace with live count metrics or beautiful empty states.

Phase 5: Update E2E Certifications (P0)
   ├── Update apps/web/e2e tests to use Supabase session simulation.
   └── Run E2E test suite to confirm complete V1 user flow works flawlessly.
```
