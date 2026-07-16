# ADR 004: Shared Catalog Price Tracking (Single-Scrape, Many-Users)

## Status
Proposed

## Context
As WishHub scales, multiple users will inevitably track the same popular products (e.g., a specific Amazon listing). A naive approach where each user's "TrackedProduct" triggers its own scraper job would lead to redundant network traffic, increased risk of anti-bot triggering, and inefficient database storage.

## Decision
We will implement a **Shared Catalog Price Tracking** model.

1.  **Catalog-Centric Execution**: Scraper jobs (`TrackingJob`) will be associated with a `CatalogProduct` (or its `Variant`), not with individual user subscriptions.
2.  **Snapshot Sharing**: When a scraper successfully retrieves a price, it records a single `PriceSnapshot` linked to the `CatalogProduct`.
3.  **User Subscriptions**: `TrackedProduct` records serve as "subscriptions" that link a `User` to a `CatalogProduct`. When a user views their dashboard or history, the system retrieves snapshots for the shared catalog entry.
4.  **Deduplicated Snapshots**: Snapshots are only persisted if price/availability changes or a 24-hour heartbeat is reached, further reducing storage bloat.

## Consequences
- **Scalability**: Fetching a price once for 10,000 users significantly reduces resource consumption.
- **Performance**: Dashboard lookups remain fast as they query a single time-series of snapshots.
- **Complexity**: Requires a "Dispatcher" to manage global scheduling and ensure only one active job exists per catalog item at a time.
- **Privacy**: Price history is global and public; user-specific data (notes, alerts) remains isolated in the `TrackedProduct` entity.
