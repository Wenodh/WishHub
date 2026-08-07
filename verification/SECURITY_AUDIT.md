# Security Audit

## 1. Secret Hygiene & Configuration Controls
The application validates environment variables at startup using the `@wishhub/env` package. This prevents runtime crashes due to missing configuration keys.

### Security Check
- **Secrets check**: No production API keys or credentials are committed to the codebase. `.env.example` is maintained as the single source of truth for required workspace environment configurations.

---

## 2. OWASP Top 10 Threat Analysis

### OWASP A01: Broken Access Control (Insecure Direct Object References)
- **Status**: **Secure**. API routes (e.g., `apps/web/lib/api/handler.ts`) fetch resource data using the authenticated user's session ID rather than relying on client-provided IDs.
- **Improvement**: Add resource ownership checks to shared link endpoints to ensure users can only access wishlists they own or those marked as public.

### OWASP A03: Injection (SQL / XSS)
- **SQL Injection**: **Secure**. Prisma ORM uses parameterized queries for all database operations, preventing SQL injection attacks.
- **XSS**: **Low Risk**. Merged HTML values scraped from merchant websites must be sanitized before rendering. Ensure any raw HTML is passed through a trusted sanitization library like `isomorphic-dompurify`.

### OWASP A05: Security Misconfiguration
- **Session Cookies**: Better Auth session cookies use the `HttpOnly` and `Secure` attributes by default, preventing access via client-side scripts.
- **CORS**: Ensure the production CORS configuration restricts API access strictly to the web domain and the verified extension ID.

---

## 3. Deployment Security & Rate Limiting
- **API Rate Limiting**: The backend currently lacks rate limiters on public-facing endpoints (e.g., login, signup, product search). Adding rate limiters is critical to prevent automated brute-force attacks and denial-of-service attempts.
- **Production Safety**: The codebase includes schema push helper scripts (`pnpm db:push`). These development-focused commands must be disabled in production deployment workflows to prevent accidental database schema modifications or data loss.
