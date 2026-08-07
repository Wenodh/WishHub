# Performance Audit

## 1. Bundle Sizes & Client-Server Hydration
WishHub is built on Next.js 15, which uses Server Components by default to optimize bundle size and speed up page load times.

### Hydration Performance Risk
- **Observation**: The dashboard page (`apps/web/app/dashboard/page.tsx`) uses client-side hooks (`useWishlists`) to fetch wishlist data. This shifts the data fetching and rendering load entirely to the client, leading to a blank loading state while fetching lists on page load.
- **Remediation**: Fetch the initial wishlist data on the server in a Server Component layout, then pass it to the Client Component dashboard grid as a hydration prop. This allows rendering the initial view instantly on the server and improves Cumulative Layout Shift (CLS) scores.

---

## 2. Database Query Performance (N+1 Risk Analysis)
Prisma queries must be structured carefully to avoid N+1 query patterns.

```prisma
// Example: Querying wishlists and resolving catalog items
prisma.wishlist.findMany({
  include: {
    items: {
      include: {
        savedProduct: {
          include: {
            catalogProduct: true
          }
        }
      }
    }
  }
})
```

### Risk: Large Joins
- **Observation**: Fetching nested relational models through a single deep Prisma query generates large SQL joins. At scale, this can result in high query execution times and elevated database memory usage.
- **Remediation**: Use database views or targeted Prisma queries to fetch shallow DTO collections, then resolve deeper item relations on demand (e.g. when a user expands a specific wishlist view).

---

## 3. Caching & State Optimization
- **Stale-While-Revalidate**: The application uses TanStack Query to cache API responses on the client, minimizing redundant network requests.
- **Missing Redis Layer**: The API lacks a server-side caching layer. Frequently fetched read-only resources, such as catalog product details, should be cached in Redis to reduce the load on the database.
- **Browser Extension Cache**: The browser extension popup queries the backend API directly on load. We should cache verified active sessions and configuration settings inside the extension's local storage to keep popup launch times under 200ms.
