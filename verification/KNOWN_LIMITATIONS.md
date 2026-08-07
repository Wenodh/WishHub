# Known Limitations (WishHub v1.0)

## 1. Context
While WishHub v1.0 is a highly polished commercial-grade SaaS product, certain architectural boundaries are defined to prevent scope creep and maintain absolute stability.

---

## 2. Platform & Scraper Limits
- **Anti-Bot Defenses**: While our `@wishhub/scraper` core utilizes standard parsing and schema extraction techniques, heavily fortified merchant sites (e.g. Amazon when triggered by high-volume scraping bursts) may occasionally request CAPTCHAs.
- **Client-Side SPA Renderers**: Obscure shopping websites built with JavaScript frameworks that do not use Server-Side Rendering (SSR) might not render prices inside the initial static HTML, meaning we fallback to DOM heuristics.

---

## 3. Scope Boundaries (Post-V1.0 Roadmap)
- **Background Cron Jobs**: Automated 24/7 cron price checks are scheduled for Version 1.1 (ADR 004). Version 1.0 utilizes robust, secure on-demand catalog scraping upon saves or manual refreshes.
- **FCM Web Push Alerts**: Browser-level push alerts are out of scope for the current launch and will be introduced alongside cron execution.
- **Export/Import Portability**: Direct imports of CSV collections from other custom wishlists are out of scope for the initial release.

---

## 4. Remediation & Fail-safes
To preserve user confidence when scrapers fail to extract particular values:
1. **Interactive Product Card Editing**: Users can manually modify, adjust, or override product titles, descriptions, and pricing fields directly in the UI.
2. **Deterministic Fallbacks**: Scrapers automatically degrade gracefully, falling back to JSON-LD, OpenGraph tags, or page meta headers before reporting field errors.
