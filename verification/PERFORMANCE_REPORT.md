# V1.0 Performance Report

## 1. Core Performance Metrics
To deliver a premium, lightweight feel, WishHub optimizes asset compilation and client caching structures. Our target performance metrics are:

- **Web Dashboard Lighthouse**: >= 94
- **Extension Popup Launch**: < 180ms
- **P95 API Response Times**: < 450ms

---

## 2. Implemented Optimizations

### Modern Font Optimization
- **Geist Variable Fonts**: Embedded local `.woff` files inside `/app/fonts/` loaded dynamically using `next/font/local`. This prevents cumulative layout shifts (CLS) and avoids external font fetch latency.

### Client-Side State & Invalidation
- **Stale-While-Revalidate**: TanStack Query is configured with deterministic cache invalidation hooks. Wishlist counts and collections load instantly while background queries update the stale state.
- **Optimistic Mutators**: Actions like creating, deleting, or moving product nodes happen instantly on the UI. The application rolls back gracefully to the cached state only if the API reports network failure.

### Database Query Optimizations
- **Index Alignment**: Enforced a composite database index `@@index([userId, addedAt])` on the `SavedProduct` model to ensure ultra-fast sorting of personal dashboard lists without full table scans.

---

## 3. Future Enhancements
- **Vercel Edge Caching**: For public-facing, read-only wishlists in v1.1, utilize Edge headers (`s-maxage`) to bypass database requests entirely for high-traffic lists.
- **Lazy Loaded Drawers**: Use `next/dynamic` to load product detail drawers on-demand, reducing the initial JavaScript bundle sizes.
