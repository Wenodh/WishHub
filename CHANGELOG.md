# WishHub v1.0.0-beta Release Notes

Welcome to the first public beta of WishHub! This release marks the completion of the core vertical slice and the multi-wishlist organization system.

## New Features

### 📦 Unified Catalog
Products are now saved into a central catalog. This means if multiple users save the same item, we keep the data normalized and high-quality.

### 📁 Multi-Wishlist Support
You are no longer limited to one long list. Create custom wishlists for "Home Office", "Birthday Ideas", or "Dream Vacation".

### ⚡ Refreshed Dashboard
A modern, responsive dashboard with:
- **Grid & List views**
- **Optimistic updates** (no waiting for loaders)
- **Advanced Search & Sort**

### 🧩 Smarter Browser Extension
The browser extension now supports:
- **Direct wishlist selection**
- **Enhanced extraction** for major retailers like Amazon.

## Improvements
- **Performance**: Optimized database queries with single-pass count aggregation.
- **Security**: Hardened authentication enforcement across all API routes.
- **Observability**: Standardized telemetry logging for better debugging.

## Known Issues
- Mobile app is currently in "Foundation" mode and not fully functional.
- Amazon extraction might occasionally fail if they change their DOM structure.
- Large wishlists (>500 items) may experience slight rendering lag in grid view.

---
Thank you for trying WishHub! Please report any bugs via GitHub Issues.
