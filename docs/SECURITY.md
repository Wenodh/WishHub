# Security Policy

WishHub takes security seriously. This document outlines our security measures and how to report vulnerabilities.

## Security Measures

### Authentication & Authorization
- **Better Auth**: We use [Better Auth](https://better-auth.com/) for secure session management.
- **Ownership Checks**: Every resource access is verified against the authenticated `userId` at the repository level.
- **API Protection**: All private endpoints are wrapped in a handler that enforces session validity.

### Data Validation
- **Zod**: Every API request is validated using strict Zod schemas from `@wishhub/contracts`.
- **Sanitization**: Product URLs are normalized and cleaned of tracking parameters before processing.

### Infrastructure
- **Prisma**: We use Prisma ORM to prevent SQL injection.
- **Environment Variables**: Managed and validated at startup via `t3-env` in `@wishhub/env`.
- **CSRF/XSS**: Protection provided by Next.js defaults and secure cookie configurations.

## Reporting a Vulnerability

If you discover a security vulnerability, please do not open a public issue. Instead, email security@wishhub.io. We aim to respond within 48 hours.

## Disclosure Policy

We will acknowledge your report, investigate the issue, and provide a fix. We ask that you give us reasonable time to resolve the issue before making it public.
