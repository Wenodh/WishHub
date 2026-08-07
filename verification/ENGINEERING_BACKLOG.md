# Engineering Backlog

## 1. Backlog Prioritization Overview
This engineering backlog prioritizes foundational improvements (such as security, stability, and data integrity) over new feature development to ensure a stable, production-ready system.

---

## 2. Priority Register

| Priority | ID | Complexity | Estimated Impact | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Critical** | **ENG-01** | Low | High | Add database indexes and cascades to prevent orphaned records and optimize dashboard loading times. |
| **High** | **ENG-02** | Medium | High | Implement Next.js Edge middleware rate limiting on public-facing API routes. |
| **High** | **ENG-03** | Medium | High | Add input validation and prompt sanitization to `packages/ai` to prevent prompt injection. |
| **Medium** | **ENG-04** | High | Medium | Build integration test suites for REST API endpoints and browser extension worker scripts (`background.ts`). |
| **Medium** | **ENG-05** | Medium | Medium | Transition local development workflows from `db push` to formal Prisma migrations. |
| **Low** | **ENG-06** | Medium | Medium | Standardize and unify Framer Motion animation timings across the web dashboard. |

---

## 3. Backlog Implementation Details

### Critical Blocker: ENG-01 (Database Indexing and Cascades)
- **Dependency**: None
- **Acceptance Criteria**:
  - `pnpm test` and `pnpm build` pass.
  - Adding a composite index on `SavedProduct` (`userId`, `addedAt`) significantly improves list sorting performance.
  - Deleting a saved product successfully cascades and cleans up associated wishlist items.

### High Priority: ENG-02 (API Rate Limiting)
- **Dependency**: ENG-01
- **Acceptance Criteria**:
  - Outgoing requests are intercepted and verified before reaching API controllers.
  - Requests that exceed 100 requests/minute are throttled, returning an HTTP 429 status code.
