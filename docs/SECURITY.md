# Security Audit & Recommendations

## Authentication & Authorization
- **Better Auth**: Used for secure session management and authentication.
- **Ownership Check**: All API routes resolved via `withApiHandler` strictly enforce ownership by deriving `userId` from the authenticated session.
- **REST Protection**: Endpoints verify resource ownership (e.g., `savedProduct.userId === session.user.id`) before allowing modifications.

## Input Validation
- **Zod**: Centralized schemas in `@wishhub/contracts` ensure all incoming data is strictly validated before processing.
- **Scraper**: Product extraction results are validated against `ExtractionResultSchema` to prevent malformed data injection.

## Application Security
- **XSS**: Next.js automatically escapes content in JSX, preventing standard XSS.
- **CSRF**: Better Auth provides built-in CSRF protection for session-based actions.
- **Secrets**: Validated at startup via `@wishhub/env`. No secrets found in client-side bundles.
- **Rate Limiting**: Currently not implemented. Recommended for v1.1 using a middleware pattern (e.g., Upstash).

## Dependency Audit
- **pnpm audit**: Successfully fixed high/critical vulnerabilities via overrides.
- **Findings**: Remaining findings in `minimatch` (nested in expo) are considered low-risk for the web/extension surface area but should be monitored for upstream patches.

## Action Plan (v1.1+)
- [ ] Implement rate limiting middleware for public API endpoints.
- [ ] Add Content Security Policy (CSP) headers to the web dashboard.
- [ ] Periodically rotate `BETTER_AUTH_SECRET`.
