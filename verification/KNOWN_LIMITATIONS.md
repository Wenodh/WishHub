# Known Limitations & Deferred Capabilities

This document chronicles known development limitations, deferred features, and environmental blocks identified during the V1 release cycle:

## 1. Environmental & Testing Blocks

1. **Local PostgreSQL Sandbox Restrictions**:
   - *Detail*: There is no local PostgreSQL server installed on the system, and running PostgreSQL inside local alpine-based Docker containers is blocked due to containerization overlayfs mount privileges.
   - *Impact*: Direct automated database integration and Playwright browser E2E test runs could not be executed locally. They are marked as `BLOCKED` in certification reports.
   - *Resolution*: Full verification of schema, build, lint, types, and unit tests has been completed. Live PostgreSQL integration verification must be completed in the Vercel/Neon staging branch.
2. **Chrome Extension Runtime Limitations**:
   - *Detail*: Built browser extension artifacts are fully packaged, optimized, and stylesheet CSS bundles are verified. However, live runtime popup execution and alarm sync checks are restricted due to headless sandbox limitations.
   - *Impact*: Extension runtime testing is marked as `BLOCKED`.

---

## 2. Deferred Capabilities (P2/P3 Roadmap)

1. **Synchronous AI Insights Execution**:
   - *Detail*: Saved products currently enqueue job records inside the `AIJob` queue. Synchronous processing requires periodic queue cron triggers.
   - *Impact*: Cron triggers are deferred. AI Insights process on-demand in milliseconds when requested, degrading gracefully to standard blank states if disabled.
2. **Price Tracking Scheduler**:
   - *Detail*: Continuous tracking and automated notification dispatcher pipelines are fully designed but require a long-running dispatcher background service.
   - *Impact*: Price history logging is inactive in local test scopes, presenting as a future V1.2 integration item.
