# Database Audit

## 1. Schema Normalization & ADR-003 Analysis
The database models are defined in `packages/database/prisma/schema.prisma`.

```prisma
model CatalogProduct {
  id           String   @id @default(cuid())
  store        String
  externalId   String?
  canonicalUrl String   @unique
  title        String
  ...
}

model SavedProduct {
  id               String   @id @default(cuid())
  userId           String
  catalogProductId String
  ...
}
```

### Critique
- **Excellent Normalization**: Normalizing products into `CatalogProduct` (merchant data) and `SavedProduct` (user metadata) successfully reduces data duplication across the platform. This normalization provides a solid basis for implementing ADR-004's shared catalog price-tracking engine.

---

## 2. Foreign Keys, Cascades, and Constraints

### Weaknesses & Recommended Changes
1. **Prisma Cascade Mismatch**:
   - Deleting a `SavedProduct` does not cascade cleanly to `WishlistItem` entries unless the join table is explicitly updated by the application service code. This design risks creating orphaned records in the database.
   - **Recommendation**: Add a cascade constraint (`onDelete: Cascade`) to the relational keys on the `WishlistItem` model inside `schema.prisma`.
2. **Missing Partial Indexes**:
   - Queries look up items using the `userId` field. While there are basic indexes on `userId` (e.g. `@@index([userId])`), complex dashboard searches are performed over un-indexed fields like `notes`.
   - **Recommendation**: Introduce multi-column indexes on highly filtered fields to optimize search performance, such as:
     ```prisma
     @@index([userId, catalogProductId])
     ```

---

## 3. Better Auth Relations
The `User` database model maps directly to Better Auth requirements:
- The schema definition matches Better Auth's expectations. This enables native sessions without needing custom mapping layers.

---

## 4. Entity Scalability Assessment
The schema design scales well. However, because we use a development-only push workflow (`prisma db push`), there are no standard migration script files in the codebase.
- **Scale Blocker**: Executing direct push operations against live production environments (e.g. Neon) without a formal migration verification step presents significant data loss risks. We must implement a migration safety policy before onboarding a high volume of users.
