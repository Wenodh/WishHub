# Founder Recommendations

## 1. Product Recommendations

### 1. Simple Extension Onboarding
- **Action**: Build an immediate browser extension onboarding flow. Right after a user signs up on the web platform, provide a direct button to install the extension, accompanied by a quick 3-step interactive onboarding guide showing them how to save their first product.
- **Why**: The browser extension is WishHub's main acquisition and retention loop. Getting users to install and use the extension on day one is critical to driving product adoption.

### 2. Beautiful Public Sharing Views
- **Action**: Optimize shared public wishlist pages with high-quality SEO tags, metadata previews, and premium, responsive grid layouts.
- **Why**: Shared public wishlists are powerful organic acquisition channels. When a user shares a wishlist with friends or family, those visitors should be greeted with a stunning visual experience that encourages them to create their own accounts.

---

## 2. Technical Recommendations

### 1. Transition to Robust Task Schedulers
- **Action**: Replace basic cron schedulers with a reliable, distributed task queue system like **BullMQ** or **Temporal**.
- **Why**: Our upcoming price-tracking engine requires running thousands of background scraping jobs. A distributed task queue ensures stable, transactional execution, provides detailed job tracking, and handles rate limiting and retries gracefully.

### 2. Implement Proxy Pools & Scraper Fallbacks
- **Action**: Deploy rotated proxy pools and fallback parsers (such as JSON-LD, OpenGraph) within `@wishhub/scraper`.
- **Why**: Major e-commerce platforms (like Amazon or target boutique stores) actively block scraping attempts. Rotating proxies and using robust fallback parsers ensures high extraction success rates.
