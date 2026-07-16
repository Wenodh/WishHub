# Performance Audit & Optimization

## Web Dashboard
- **Load Time**: Prerendered static pages (Home, Dashboard) ensure fast initial paint.
- **React Performance**: `useMemo` utilized in `ProductGrid` to optimize filtering and sorting of large lists.
- **Bundle Optimization**: Next.js App Router (using Turbopack) minimizes runtime overhead.
- **Rendering**: Heavy dialogs and settings are conditionally rendered to keep the main thread clear.

## Browser Extension
- **Popup Open**: <200ms target achieved via `chrome.storage.local` caching.
- **Extraction**: Normalized and handled in the content script context to minimize popup latency.
- **Caching**: Stale-while-revalidate pattern implemented for wishlists (5-minute TTL).

## API & Database
- **Response Times**: CRUD operations optimized via direct Prisma queries.
- **Query Efficiency**: Relationship fetching (e.g., `include: { items: true }`) used judiciously to avoid N+1 problems.
- **Pagination**: Offset-based pagination standard adopted for list endpoints.

## Optimization Actions
- [x] Implemented `useMemo` for client-side product filtering.
- [x] Added `Suspense` boundaries for dashboard loading states.
- [x] Optimized extension wishlist loading with storage cache.
- [x] Centralized URL normalization to prevent redundant processing.
