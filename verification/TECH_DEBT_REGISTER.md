# Technical Debt Register

## 1. Quality & Technical Debt Rating
The WishHub codebase features a highly modular, clean feature-first structure. However, rapidly building features across multiple milestones has introduced some technical debt.

---

## 2. Tech Debt Register

| ID | Priority | Effort (est) | Category | Description |
| :--- | :--- | :--- | :--- | :--- |
| **TD-01** | **Critical** | 3 days | Database | Missing foreign key cascades and indexes on `SavedProduct` and `WishlistItem` tables inside `schema.prisma`. |
| **TD-02** | **High** | 2 days | API Security | Lack of rate limiting middleware on public API routes and session verification endpoints. |
| **TD-03** | **High** | 2 days | State Sync | Extension popup lacks state validation against the backend API, presenting stale cached data on load. |
| **TD-04** | **Medium** | 2 days | AI Pipeline | Prompt construction lacks token safety checks and input validation, risking prompt injection and high token costs. |
| **TD-05** | **Medium** | 3 days | Testing | Missing integration tests for REST API endpoints and browser extension worker files (`background.ts`). |
| **TD-06** | **Low** | 1 day | Visuals | Inconsistent Framer Motion animation timings and custom component styling properties on the web dashboard. |

---

## 3. Remediation Roadmaps

### Critical Blocker: TD-01 (Database Cascades)
- **Problem**: Deleting a wishlist or saved product does not cascade cleanly to join tables, risking orphaned relational records.
- **Action**: Update `schema.prisma` to include explicit cascade rules, run database pushes to sync changes, and update service logic to handle deletions cleanly.

### High Priority: TD-02 (API Rate Limiting)
- **Problem**: API endpoints are vulnerable to automated scraping and brute-force attacks due to a lack of rate limiters.
- **Action**: Add an Edge middleware rate limiter using `@upstash/ratelimit` to intercept and throttle requests before they reach backend handlers.
