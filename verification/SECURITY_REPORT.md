# WishHub Production Security Report

## 1. Security Posture Summary
WishHub is built upon a **zero-trust** data access architecture. Every operation modifying user data (such as creating, deleting, or moving products and wishlists) requires session verification, with no reliance on untrusted client-provided identifiers.

This report summarizes core security controls, OWASP protections, and the recent hardening actions applied during our launch stabilization pass.

---

## 2. Hardened Security Controls

### Identity & Access Control
- **No IDOR (Insecure Direct Object Reference)**: Every user-specific database write, update, or read is derived strictly from the active session context (`session.user.id`) populated by Better Auth HTTP-only cookies.
- **Session-Protected REST Endpoints**: Wrapped all Next.js route handlers in `withApiHandler`, which automatically performs session authentication checks and returns JSON `401 Unauthorized` responses to unauthenticated callers.

### Edge Middleware Rate Limiting
- **Adaptive Throttling**: Memory-efficient, Edge-compatible rate limiters block denial-of-service (DoS) and brute-force enumeration attacks on all endpoints under `/api/*` with customized window categories:
  - **Auth**: 10 requests / minute max.
  - **AI Generation**: 5 requests / minute max.
  - **Extension Saves**: 60 requests / minute max.
  - **Public Routes**: 120 requests / minute max.
- **Throttling Responses**: Blocked request counts receive standardized `429 Too Many Requests` responses with dynamic header parameters (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`).

### Secure HTTP Security Headers
- Added robust security headers to all page and endpoint loads via `apps/web/next.config.js`:
  - **`X-Frame-Options: DENY`**: Prevents UI clickjacking hijacking.
  - **`X-Content-Type-Options: nosniff`**: Enforces strict MIME sniffing protection.
  - **`Referrer-Policy: origin-when-cross-origin`**: Protects referrer metadata leakage.
  - **`Strict-Transport-Security (HSTS)`**: Enforces strict HTTPS communication for 1 year (`max-age=31536000`).
  - **`X-XSS-Protection: 1; mode=block`**: Prevents cross-site scripting script injection.

### SQL & Prompt Injection Prevention
- **Database Safety**: Database interactions are performed using Prisma ORM parameterized statements, preventing SQL injection exploits.
- **AI Safety**: Enforces rigid prompt parameters in `PromptManager` rendering and leverages OpenAI JSON-mode response formatting validated by robust Zod schemas to handle AI provider parsing safely.
- **API Secret Access**: Added `CRON_SECRET` bearer token validation inside `/api/ai/jobs/route.ts` to block unauthorized trigger calls from depleting OpenAI spending limits.
