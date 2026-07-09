# ADR 003: Wishlist Hierarchy & Data Normalization

## Status
Accepted

## Context
As WishHub moves from a simple "saved list" to a multi-wishlist platform, we need to handle data efficiently. Storing identical product data (e.g., for a popular Amazon item) for every user who saves it leads to massive data redundancy and makes price tracking/updates difficult.

## Decision
We will split the product data into two entities:

1.  **CatalogProduct**: Stores store-specific, user-agnostic data (canonical URL, name, brand, description, images). This is unique by `canonicalUrl`.
2.  **SavedProduct**: Stores user-specific associations and metadata (notes, labels, archive status). This links a `User` to a `CatalogProduct`.

Additionally, we introduce:
3.  **Wishlist**: A named collection of user products.
4.  **WishlistItem**: A pure join table between `Wishlist` and `SavedProduct`.

## Consequences
- **Positive**: Dramatically reduced storage requirements for popular products.
- **Positive**: Foundation for global price tracking (update one `CatalogProduct`, notify all `SavedProduct` owners).
- **Positive**: Users can organize products into multiple wishlists without duplicating the underlying save record.
- **Negative**: Queries for "Product Details" now require a join between `SavedProduct` and `CatalogProduct`.
- **Negative**: Increased complexity in the `SaveProductService` (orchestrating the two-step creation).
