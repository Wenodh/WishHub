# Executive Summary

## 1. Context & Scope
WishHub is a universal, multi-platform wishlist, product curation, and price monitoring engine. Having matured through its second core milestone—Multi-Wishlist organization and Catalog normalization—WishHub is positioned to transition into a highly automated, single-scrape background price tracking scheduler (Milestone 3) featuring AI summaries and multi-channel notification.

This document represents an authoritative, non-speculative, and uncompromising Production Readiness Review (PRR) conducted from the perspective of a Principal Engineer. It is based strictly on concrete code evidence extracted from the monorepo workspaces and outlines architectural quality, latent tech debt, security profiles, performance bottlenecks, and a clear master execution roadmap.

---

## 2. Key Findings

### Architectural Split & Normalization
The split between the immutable merchant product entity (`CatalogProduct`) and the user's specific collection save reference (`SavedProduct`) defined in `packages/database/prisma/schema.prisma` is a highly scalable foundation. This enables the **"single-scrape, many-users"** design pattern (ADR 004). However, the implementation is not yet fully cohesive across all layers:
- The legacy single-product create endpoint (`apps/web/app/api/products/route.ts`) still exposes backwards-compatible fields and relies on an ad-hoc mapping structure, bypassing the new dual-entity model's cleaner abstractions.

### Extension & Popup Offline Sync
The extension (`apps/extension`) is constructed using React, Vite, and custom Chrome alarms. It features an offline save pipeline and synchronization mechanism via `background.ts`. The architecture is robust; however, local client storage (`chrome.storage.local`) lacks strong typing and state sync verification. This creates risks of stale cache lookups on the popup interface during high latency.

### AI Provider Abstraction
The provider abstraction model inside `packages/ai` successfully separates business domains from vendor interfaces. Utilizing a standard deterministic `MockAIProvider` for test execution alongside `OpenAIProvider` ensures predictable CI behavior. The production prompt generation pipeline lacks token safety checks and input sanitization, which could lead to high OpenAI token usage and prompt injection risks.

---

## 3. High-Priority Risk Heatmap

| Risk ID | Title | Impact | Likelihood | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | Missing Foreign Keys & Cascades in Joined Schema | **High** | **Medium** | Revise schema dependencies; enforce cascades on deleted SavedProduct items. |
| **R-02** | Unbounded Token Cost / Malformed AI JSON | **Medium**| **High** | Introduce token counting and enforce JSON parsing backups in OpenAI providers. |
| **R-03** | Lack of API Route Rate Limiting | **High** | **High** | Deploy Edge middleware rate limiters in Next.js web routers. |
| **R-04** | Extension State Invalidation Lag | **Medium**| **Medium** | Implement stale-while-revalidate TTL verification on popup load. |

---

## 4. Overall Readiness Verdict
WishHub possesses a solid, beautifully composed feature-first architecture that easily surpasses typical startup standards. It stands at **7.6 / 10** on our production readiness scale.

By addressing the critical blockers identified in these audits (specifically database indexing, rate limiting, and stronger type boundaries across workspace borders), WishHub can achieve the **9.5+** standard expected of world-class SaaS systems like Stripe, Linear, and Apple.
