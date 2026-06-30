# Project Roadmap

The evolution of WishHub from foundation to production-grade SaaS.

## Phase 0: Foundation (COMPLETED)
- Turborepo/pnpm setup
- Shared config/tooling
- Infrastructure packages (Database, Auth, Env, Core)
- Minimal Design System (UI)
- Architecture documentation (ADRs, Diagrams)

## Phase 1: Vertical Slice
- Browser Extension popup & background
- Scraper core with generic parser
- Authentication flow (Web & Extension)
- Save product end-to-end (Extension -> API -> DB)
- Minimal Web Dashboard (View/Delete products)

## Phase 2: Wishlists
- Multiple user-defined collections
- Move products between wishlists
- Shared wishlists (read-only links)
- Wishlist metadata (icons, colors)

## Phase 3: Catalog
- Product normalization and de-duplication
- Store-specific adapters (Amazon, Flipkart, etc.)
- Brand and Category auto-assignment
- Variant tracking

## Phase 4: Android/iOS
- React Native (Expo) app development
- Mobile authentication
- Native share sheet integration (Save from other apps)
- Offline support

## Phase 5: Price Tracking
- Background jobs for price updates
- Price history visualization
- Price drop alerts (Web/Mobile)
- Currency conversion

## Phase 6: Notifications
- Email alerts (Resend)
- Push notifications (FCM)
- In-app notification center
- Preference management

## Phase 7: AI Assistant
- Recommendation engine
- Similar product search
- Auto-categorization
- Personalized shopping insights

## Phase 8: Scaling & Optimization
- Advanced search (Algolia/Elasticsearch)
- Global CDN optimization
- Performance monitoring (Sentry)
- Enterprise features (Teams, Workspaces)
