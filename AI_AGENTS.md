# WishHub AI Coding Agent Guidelines (`AI_AGENTS.md`)

This document is the absolute single source of truth and authoritative operating manual for all AI coding agents (including Jules, Codex, Claude Code, Cursor, GitHub Copilot Agent, and Gemini CLI) and human engineers contributing to the WishHub repository.

It defines our core product direction, priority hierarchy, technical standards, testing criteria, and agent workflow instructions. Every AI agent must ingest and strictly adhere to this guide. Deviation from these principles will result in failed code reviews and rejected contributions.

---

## CORE PRODUCT DIRECTION

WishHub V1 is a **Universal Wishlist application**, not an AI platform, scraping platform, or price-tracking platform.

The fundamental user journey must work reliably:

```text
User
 ↓
Authenticate (Supabase Auth)
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

AI shopping intelligence, price tracking, notifications, recommendations, social features, mobile parity, advanced scraping, embeddings, realtime infrastructure, etc. must be treated as future capabilities unless explicitly promoted into the current milestone.

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

Do not introduce infrastructure merely because it could be useful later.

### Rule 2 — No fake functionality
Never use:
- fake prices
- fake price history
- fabricated discounts
- fake notifications
- fake activity events
- fake AI results
- hardcoded dashboard statistics
- mock production data presented as real data

Mocks are acceptable only in explicitly isolated tests/development environments. If a feature does not have real data behind it, the UI must clearly represent the feature as unavailable, coming soon, or omit it.

### Rule 3 — Never block the core product on optional intelligence
WishHub must remain fully functional if:
- AI provider is unavailable
- scraping fails
- price tracking is unavailable
- notifications fail
- an external merchant blocks requests
- an optional background job fails

A user must still be able to save a product/link manually.

### Rule 4 — Prefer boring infrastructure
Use the simplest architecture that solves the current problem. Do not introduce:
- Redis
- Kafka
- WebSockets
- microservices
- vector databases
- complex event buses
- distributed job infrastructure

unless the current requirements demonstrably require them.

---

## 2. PRODUCT PRIORITY HIERARCHY

Agents must not work on lower-priority tiers while higher tiers contain known broken functionality, unless the user explicitly requests it.

```text
P0 — Core Wishlist
    Authentication (Supabase Auth)
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

P4 — Expansion (Deferred)
    Sharing / Collaboration
    Gifting
    Mobile application
    Advanced recommendation systems
```

---

## 3. SOURCE-OF-TRUTH ARCHITECTURE

The agent must understand the following conceptual model:

```text
User
 │
 └── Wishlist
       │
       └── WishlistItem
              │
              └── CatalogProduct
```

A product may be saved into multiple wishlists without unnecessarily duplicating normalized catalog data.

The exact repository schema is authoritative. Agents must inspect the current Prisma schema before proposing changes. Do not blindly recreate existing models.

Before modifying the database:
1. Inspect `prisma/schema.prisma`
2. Inspect existing repositories/services
3. Inspect API contracts
4. Inspect existing queries
5. Inspect tests
6. Determine whether an existing model already solves the requirement

Avoid duplicate models and parallel abstractions.

---

## 4. AUTHENTICATION

For V1, authentication must remain simple and unified.

**Supabase Auth is the authoritative authentication platform.**

Minimum requirements:
- signup
- login
- logout
- session persistence
- protected application routes
- authenticated API access
- user ownership checks
- user isolation

Never build a custom authentication system when Supabase Auth already provides the required functionality. If legacy authentication configurations (such as Better Auth) exist in the repository, prioritize migrating them completely to Supabase Auth to avoid dual auth layers running in parallel.

Agents must never commit secrets. Environment variables belong in environment configuration, never source code.

---

## 5. THE "ADD ANYTHING" PRINCIPLE

This is one of the most important product rules. The user must always be able to save something.

```text
+ Add to Wishlist
        │
        ├── Product URL
        │      ↓
        │   Try metadata extraction
        │      ↓
        │   Success → save
        │
        │   Failure → manual fallback
        │
        └── Manual Product
               ↓
             save
```

Scraping must NEVER be a hard dependency for saving. If a URL cannot be parsed, the manual fallback form must let the user specify:
- Title
- URL
- Price (optional)
- Image (optional)
- Notes (optional)

to create a valid wishlist item. This principle takes priority over sophisticated scraper architecture.

---

## 6. PRODUCT IMPORT

When importing a URL, attempt to extract useful metadata such as:
- title
- image
- price
- currency
- merchant
- description
- external product identifier

But extraction is best-effort. The system must gracefully handle:
- unsupported websites
- malformed URLs
- blocked requests
- missing metadata
- redirects
- network failures
- duplicate products

Never make the entire save operation fail simply because optional metadata extraction failed.

---

## 7. DATABASE RULES & WORKFLOW

PostgreSQL hosted on Supabase is the persistence layer. Prisma is used for application database access.

### Database Workflow Protocol
- **Development**: Use schema push (`pnpm db:push` / `prisma db push`) inside packages/database during local iterations. There is no `prisma/migrations` folder; schema push is our active development workflow.
- **Prisma Client Generation**: Client generation is required before running builds. Run `pnpm db:generate` to generate the client.
- **Zero-Downtime Schema Updates**: Never perform breaking database changes. If renaming a column:
  1. Add new column.
  2. Double-write to both.
  3. Backfill database.
  4. Move reads to new column.
  5. Delete legacy column in next release.
- Never reset or destroy a shared/production database. Never assume the database is empty.

---

## 8. API RULES

API routes must be:
- authenticated where required
- authorized
- validated
- predictable
- consistent
- safe against malformed input

Use existing shared API handlers/contracts when they already exist. Before creating a new API abstraction, search the repository for an existing equivalent.

Prefer:
```text
Zod contract -> API handler -> domain/service -> repository -> database
```

Avoid putting large amounts of business logic directly inside route handlers. Never trust a client-provided `userId`. Always derive ownership from the authenticated session.

### Standardized Response Formatting
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

## 9. USER ISOLATION

This is a release-blocking requirement. Every user-owned resource must be scoped to the authenticated user.

Agents must actively test for IDOR-style failures:
```text
User A attempts to access User B's wishlist/product/resource -> Must receive authorization failure
```

Never rely solely on the frontend hiding another user's data. Authorization must exist server-side.

---

## 10. UI/UX DESIGN SYSTEM

WishHub should feel like a premium consumer application. Target design direction:
- Apple
- Linear
- Vercel

**However, visual polish must never hide broken functionality.**

Prioritize:
- Clear hierarchy
- Excellent empty states
- Responsive design
- Fast interactions
- Subtle motion (Framer Motion)
- Useful loading states
- Meaningful error states
- Accessible controls
- Keyboard navigation
- Mobile usability

### Custom Design Tokens
Avoid raw inline styles and arbitrary Tailwind configurations. Reuse the following premium design tokens defined in `@wishhub/ui/src/styles/globals.css`:
- **Gradients**: Use `.premium-gradient-text` for headings (`bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900`).
- **Glassmorphism**: Use `.premium-glass` for overlay dialogs, navbar backgrounds, and hover indicators (`backdrop-blur-xl bg-white/75 border-neutral-200/50`).
- **Elevation**: Use `.premium-shadow` for card lifts.
- **Corners**: Use generous rounded edges (`rounded-2xl` and `rounded-3xl`). Do not use harsh 90-degree boxes.

---

## 11. DASHBOARD RULES

The dashboard should represent real user data.

Valid dashboard information includes:
- number of wishlists
- actual item counts
- recently added products
- actual products
- actual wishlist activity

Invalid:
- "3 price drops" when no price tracking system is actively tracking prices.
- "₹4,500 saved" when the value is fabricated.

If there is insufficient real data, use a useful empty state instead.

---

## 12. AI RULES

AI is an optional enhancement and must remain architecturally isolated.

AI must never be required for:
- saving
- viewing
- editing
- deleting
- organizing
- searching

AI input must be treated as untrusted data. AI output must never silently become authoritative product data. Implementations must route through the `AIProvider` contract interface (`packages/ai`) supporting:
- **MockAIProvider**: Enabled by default during development, tests, and CI pipelines via `AI_PROVIDER=mock`.
- **OpenAIProvider**: Utilized in production environment routes (`AI_PROVIDER=openai`). Calls `gpt-4o-mini` with structured JSON output formatting.

---

## 13. PRICE TRACKING RULES (POST-V1)

Do not simulate price tracking. Only introduce price intelligence once there is real, persisted historical data.

The correct conceptual architecture is:
```text
CatalogProduct -> PriceSnapshot (price, currency, source, capturedAt)
```

Only then calculate:
- historical high / low
- price changes & discount trends
- price alerts

Never derive a fake "original price" from the current price.

---

## 14. BROWSER EXTENSION

The extension's primary job is:
```text
Browse product -> Save to WishHub -> Choose wishlist -> Success
```

It must gracefully handle:
- authentication expiry
- duplicate products
- network failures
- unsupported pages
- missing metadata
- API errors

Cached data may improve performance, but stale cache must never silently overwrite newer server state.

---

## 15. TESTING REQUIREMENTS

Every major feature must have tests appropriate to its risk.

### V1 Certification E2E Journey Requirements
At a minimum, verify this master journey via Playwright E2E suites (`apps/web/e2e`):
1. Sign up
2. Sign in
3. Protected dashboard access
4. Create wishlist
5. Add URL product
6. Metadata extraction success
7. Metadata extraction failure → manual fallback
8. Save product
9. Product appears in wishlist
10. Edit product
11. Delete product
12. Delete wishlist
13. Duplicate prevention
14. User isolation (User A cannot access User B's data)
15. Logout
16. Login again and verify persistence

Do not rewrite tests merely to make them green. Update outdated tests when the product UX legitimately changes, but preserve behavioral coverage.

---

## 16. DEFINITION OF V1 DONE

A feature is complete when:
```text
Implementation + Validation + Authorization + Error handling + Loading state + Empty state + Tests + Responsive UX + Production build
```
are appropriately covered.

Ultimately, V1 is complete when a real user can independently:
**Create an account → create a wishlist → paste any product URL → save it → see it in the wishlist → manage it → log out → log back in → still see the data.**

That journey must work against the real Supabase database.

---

## 17. REPOSITORIES DIRECTORY GUIDE

- `apps/web`: Main SaaS product portal, pricing, routing, and Next.js backend REST endpoints.
- `apps/extension`: Native chrome content extraction popup built on Vite + Tailwind CSS.
- `packages/database`: Single-point repository mapping for PostgreSQL and Prisma initialization.
- `packages/contracts`: Contains Zod contract validation schemas shared between extension and web.
- `packages/ui`: SaaS visual design component library (reusable Button, Input, Card, Drawer).
- `packages/scraper`: Normalized multi-store extractor algorithms, normalizers, and fallback engines.
- `packages/ai`: standalone package containing the isolated `AIProvider` contract layer.

---

## 18. AGENT WORKFLOW & ANTI-PATTERNS

Before implementing anything, future AI agents must follow this exact sequence:

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

---

## 19. CURRENT DEVELOPMENT PRIORITY

When no explicit task is provided, agents should prioritize the following order:

```text
1. Broken core functionality
2. Authentication / authorization (Supabase Auth Migration)
3. Add-to-wishlist flow (with manual form override)
4. Wishlist CRUD
5. Product CRUD
6. Search/filter/sort
7. Browser extension save flow
8. Error handling
9. Tests
10. Performance
11. Accessibility
12. UI polish
13. AI
14. Price tracking
```

---

## 20. ROADMAP AFTER V1

Document the future roadmap but do not implement it unless explicitly requested:

```text
V1: Universal Wishlist (Core, Manual Form, Supabase Auth)
  │
  └── V1.1: AI Shopping Intelligence (On-demand insights, strict guardrails)
        │
        └── V1.2: Price History & Tracking (Continuous single-scrape)
              │
              └── V1.3: Price Alerts & Notifications (Firebase messaging)
                    │
                    └── V2: Sharing / Collaboration / Gifting
```

The most important instruction for every future agent is:

> **Build the simplest, most reliable product that solves the user's problem today. Do not build infrastructure for a hypothetical future before the current user journey is excellent.**
