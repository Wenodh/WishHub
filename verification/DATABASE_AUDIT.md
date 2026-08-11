# Database Audit Report

This report evaluates the database model architecture, constraints, scaling profiles, and migration safety protocols for WishHub's production Neon PostgreSQL platform.

---

## 1. Schema Normalization & Domain Integrity

The database tables are designed using a highly normalized, catalog-centric data model in `packages/database/prisma/schema.prisma`:

- **CatalogProduct (Global)**: Persists canonical, store-specific merchant product details (canonicalUrl, title, images, category, description). It is shared across all users to optimize price-tracking performance.
- **SavedProduct (Private)**: Represents user-specific saves (originalUrl, addedAt, archivedAt). It links `User.id` directly to a `CatalogProduct.id`.
- **Wishlist (Private)**: Collects user lists.
- **WishlistItem (Private)**: Links `SavedProduct` entries to `Wishlist` collections.

### Critique
- **Excellent Domain Boundaries**: The separation of public product data (`CatalogProduct`) from user ownership metadata (`SavedProduct`) is extremely elegant. It guarantees data deduplication and enables optimized single-scrape price-tracking operations.

---

## 2. Neon Auth Identity Mapping & Relations

Under our production architecture, database concerns are separated:
- **Neon Auth Schema (`neon_auth`)**: Neon Auth fully manages session states, verification tokens, and user credentials inside dedicated, isolated tables.
- **WishHub Application Schema (`public`)**: We preserve the `User` model inside our public application schema to establish standard database relations:

```text
Neon Auth Cloud (user_id)
        ↓
public.User (id, email, name, image)
        ├─→ public.Wishlist (userId)
        └─→ public.SavedProduct (userId)
```

### Profile Synchronization Pattern
We enforce a single, secure server-side synchronization point inside `auth.api.getSession()` to automatically sync user accounts into the public `User` table upon their first authentication request:

```typescript
await prisma.user.upsert({
  where: { id: neonAuthUser.id },
  update: { email: neonAuthUser.email, name: neonAuthUser.name, image: neonAuthUser.image },
  create: { id: neonAuthUser.id, email: neonAuthUser.email, name: neonAuthUser.name, image: neonAuthUser.image },
});
```

This guarantees:
1. Complete referential integrity across the database.
2. Fast lookups on user-owned relations without querying the auth schema.

---

## 3. Database Indexes & Query Performance

The schema is heavily optimized with multi-column composite indexes for our core queries:

1. **SavedProduct Composite Sort Index**:
   ```prisma
   @@index([userId, addedAt])
   ```
   Optimizes dashboard views sorting saved products by date.
2. **CatalogProduct Lookup Index**:
   ```prisma
   @@index([canonicalUrl])
   ```
   Provides sub-millisecond lookup times for duplicate prevention during product saving.
3. **Wishlist Index**:
   ```prisma
   @@index([userId])
   ```
   Optimizes layout navigation sidebar listing.

---

## 4. Production Database Safety & Change Management Policy

To ensure high-availability and zero-downtime, the project strictly enforces these database rules:

1. **Development Iterations**: Schema push (`pnpm db:push` / `prisma db push`) is permitted ONLY inside local sandboxes or isolated staging development branches.
2. **Production Policy**:
   - **No Destructive Operations**: Running raw schema pushes or database resets against the production Neon cluster is strictly prohibited.
   - **Schema Deltas**: Before any production deployment, a manual schema diff check must be executed.
   - **Prisma Migrations**: If columns are modified or deleted, a multi-step double-write transition strategy must be used (Add column → Double-write → Backfill data → Shift reads → Delete old column). This ensures zero user disruption.
