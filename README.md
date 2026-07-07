# WishHub — Milestone 2: Wishlists

Milestone 2 transforms WishHub into an organized platform by introducing multi-wishlist support and a scalable data model.

## Key Accomplishments

### 1. Multi-Wishlist System
- **Create, Rename, Delete**: Full CRUD support for wishlists.
- **Default Wishlist**: Every user has a default wishlist where items are saved by default.
- **Dynamic Selection**: Choose which wishlist to save into directly from the browser extension.

### 2. Scalable Data Model (ADR 003)
- **Catalog vs. Saved**: Separated global product data from user-specific saves, significantly reducing redundancy.
- **M:N Wishlist Association**: Products can now belong to multiple wishlists or exist independently in a user's collection.

### 3. Dashboard Refresh
- **New Sidebar**: Easily navigate between wishlists or view all products.
- **Polished UI**: Integrated Radix-UI dialogs and improved product cards.
- **Search & Sort**: Advanced filtering within specific wishlists.

### 4. Extension Integration
- **Contextual Saving**: Select target wishlists during extraction.
- **Smart Defaults**: Remembers your last-used wishlist for a faster saving experience.

## Getting Started

1. `pnpm install`
2. `pnpm exec turbo build`
3. `pnpm test`

## Architecture
See `architecture/decisions/003-wishlist-hierarchy.md` for details on the new product data model.
