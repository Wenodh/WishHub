# Database Schema & Architecture

## Overview
WishHub uses Prisma with a PostgreSQL (Supabase) backend. The schema is designed to separate global product data from user-specific interactions.

## Entity Relationship Diagram
```mermaid
erDiagram
    User ||--o{ SavedProduct : owns
    User ||--o{ Wishlist : owns
    CatalogProduct ||--o{ SavedProduct : references
    CatalogProduct ||--o{ CatalogProductImage : has
    SavedProduct ||--o{ WishlistItem : contains
    Wishlist ||--o{ WishlistItem : contains

    User {
        string id PK
        string email
    }

    CatalogProduct {
        string id PK
        string name
        string canonicalUrl UK
        string description
        string storeName
        float price
        string currency
    }

    SavedProduct {
        string id PK
        string userId FK
        string catalogProductId FK
        string notes
        boolean archived
    }

    Wishlist {
        string id PK
        string userId FK
        string name
        boolean isDefault
    }

    WishlistItem {
        string id PK
        string wishlistId FK
        string savedProductId FK
        datetime addedAt
    }
```

## Design Rationale
- **Catalog vs. Saved**: Products are first identified by their canonical URL in the `CatalogProduct` table. When a user saves a product, we link a `SavedProduct` record to the global catalog entry. This allows us to track price history and product metadata globally while keeping user notes and wishlist associations private.
- **Normalization**: Centralized store names and currencies ensure consistent filtering across the platform.
- **Indexing**:
    - `CatalogProduct.canonicalUrl`: Unique index for fast duplicate detection.
    - `SavedProduct.userId`: Index for fast dashboard loading.
    - `WishlistItem(wishlistId, savedProductId)`: Composite unique index to prevent duplicate items in the same wishlist.
