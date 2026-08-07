# Product Vision

## 1. What is WishHub?
WishHub is the world's most elegant, universal wishlist platform and personal shopping companion. It breaks down the walls of closed merchant ecosystems (e.g. Amazon, Walmart, eBay) by providing a unified, cross-platform space where users can curate, organize, and track any product from any website across the internet.

---

## 2. Core Value Propositions

### Why will users choose WishHub?
1. **Unconstrained Freedom**: Curate items from independent boutique stores and large e-commerce platforms in a single, beautiful dashboard.
2. **Design-Centric Appeal**: Unlike cluttered merchant wishlists or plain spreadsheets, WishHub is built with an elegant SaaS design (generous whitespace, light/dark parity, fluid layout transitions) that makes list curation feel like a premium experience.
3. **Data Normalization (No Redundant Saves)**: Thanks to our normalized product architecture (splitting raw item catalog records from user saved references), popular products are updated once globally, reducing database overhead and laying the groundwork for real-time tracking.

### Why will users return?
- **Price and Availability Alerts**: Users receive real-time notifications when saved products drop in price or come back into stock.
- **Smart Collections**: Machine learning automatically tags, categorizes, and groups saved items into smart folders (e.g. "Tech Accessories", "Travel Gear") without manual user tagging.
- **Shared Collaboration**: Collaborative list planning allows families, couples, and teams to build registries and gift lists together.

---

## 3. Unfair Advantages & Key Competitors

### Unfair Advantages
- **Monorepo Design & Extensibility**: Out-of-the-box support for browser extensions, web dashboard platforms, and mobile apps (Expo React Native) using a single Client SDK and shared Zod validation contracts.
- **Catalog Normalization Model**: The "single-scrape, many-users" tracking architecture allows WishHub to monitor thousands of products at minimal server and network cost.

### Weaknesses (And How We Solve Them)
- **Scraper Anti-Bot Protections**: Large merchants frequently rotate their HTML structures or block automated scraper requests.
  - *Solution*: Route background scrape jobs through dynamic proxy rotation pools and utilize fallback parsers (JSON-LD, OpenGraph metadata) to guarantee robust extraction.
