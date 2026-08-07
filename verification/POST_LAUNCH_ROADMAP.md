# Post-Launch Product Roadmap

## 1. Version 1.1: Automated Price Tracking (Milestone 3)
Following our successful Version 1.0 Release, Version 1.1 will shift our core price tracking pipeline into a fully automated, background scheduled delivery engine based on the designs in ADR 004.

- **Scheduled Worker Dispatcher**: Implement continuous, cron-scheduled `TrackingJob` execution that runs multi-user price checks in the background.
- **Price Snapshots Engine**: Persist global `CatalogProduct` price history changes to build visual charts.
- **Transactional Alert Systems**: Deliver email alerts (via Resend) and browser push notifications (via FCM) to notify users when tracked products drop in price.

---

## 2. Version 1.2: Social Curation & Collaboration
- **Public Wishlist Sharing**: Allow users to share dynamic, read-only public wishlist URLs with beautiful SEO metadata configurations, designed to be indexed on search engines.
- **Joint Wishlist Collaboration**: Multi-user permissions allowing families, partners, or wedding registrants to edit, curate, or comment on a shared list in real-time.
- **Social Gifting Statuses**: Marking items as "purchased" or "reserved" on registries securely without spoiling surprises for list owners.

---

## 3. Long-Term Architecture (3-Year Vision)
- **Vector Search Similarity**: Incorporate OpenAI embeddings (`EmbeddingSimilarityStrategy`) and pgvector inside Supabase to suggest highly accurate similar products and alternate merchants automatically.
- **Universal Mobile Apps**: Launch our React Native / Expo Universal mobile app (`apps/mobile`) to App Store and Google Play platforms.
