# Technical Debt Register

This document tracks intentional architectural shortcuts, deferred features, and areas for future improvement.

## AI
- **Reason:** Focus on core wishlist functionality first.
- **Priority:** Low
- **Estimated Milestone:** Phase 7
- **Dependencies:** Catalog, Wishlist, Scraper
- **Risks:** High complexity, requires significant training data or expensive LLM calls.
- **Approximate Complexity:** L

## Notifications
- **Reason:** Not required for MVP saving/viewing.
- **Priority:** Medium
- **Estimated Milestone:** Phase 6
- **Dependencies:** Database, Auth, Realtime
- **Risks:** Device-specific implementation complexity (FCM/APNS).
- **Approximate Complexity:** M

## Price Tracking
- **Reason:** Requires background workers and robust cron infrastructure.
- **Priority:** High
- **Estimated Milestone:** Phase 5
- **Dependencies:** Scraper, Jobs, Database
- **Risks:** Anti-scraping measures, high resource consumption for frequent checks.
- **Approximate Complexity:** L

## Search
- **Reason:** Database-level indexing is sufficient for initial user collections.
- **Priority:** Low
- **Estimated Milestone:** Phase 8 (Scaling)
- **Dependencies:** Database, Catalog
- **Risks:** Advanced search (Elasticsearch/Algolia) introduces infrastructure overhead.
- **Approximate Complexity:** M

## Analytics
- **Reason:** Focus on user value before usage tracking.
- **Priority:** Medium
- **Estimated Milestone:** Phase 1 (Post-MVP)
- **Dependencies:** Telemetry
- **Risks:** Privacy compliance (GDPR/CCPA).
- **Approximate Complexity:** S

## Feature Flags
- **Reason:** Minimal flags needed during initial development.
- **Priority:** Medium
- **Estimated Milestone:** Phase 1
- **Dependencies:** Config, Env
- **Risks:** Conditional logic sprawl.
- **Approximate Complexity:** S

## Mobile
- **Reason:** Web and Extension are primary capture/view platforms.
- **Priority:** High
- **Estimated Milestone:** Phase 4
- **Dependencies:** API Client, SDK, Core
- **Risks:** React Native environment maintenance.
- **Approximate Complexity:** L

## Extension
- **Reason:** Core scraper, but focus is on the vertical slice first.
- **Priority:** High
- **Estimated Milestone:** Phase 1
- **Dependencies:** Scraper, SDK, Contracts
- **Risks:** Browser review process.
- **Approximate Complexity:** M

## Documentation
- **Reason:** Fumadocs is initialized but content is deferred.
- **Priority:** High
- **Estimated Milestone:** Phase 0 (Continuous)
- **Dependencies:** All packages
- **Risks:** Stale documentation.
- **Approximate Complexity:** M
