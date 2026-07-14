# Testing Strategy

## Overview
WishHub uses a multi-layered testing strategy to ensure reliability across the monorepo.

## Unit Testing (Vitest)
Used for utility libraries and isolated logic.
- **Run**: `pnpm test` or `pnpm --filter <package> test`
- **Focus**: `packages/utils`, `packages/scraper` (normalizers), `apps/extension` (storage/background logic).

## Integration Testing
Verifies the interaction between the SDK, API, and Database.
- **Tools**: Vitest with MSW or direct Supertest-style API testing.
- **Focus**: `apps/web/api` endpoints and `packages/sdk` methods.

## Frontend Verification
- **Tools**: Playwright.
- **Focus**: Critical user flows like Save Product, Wishlist Creation, and Authentication redirects.

## CI/CD Integration
GitHub Actions runs the following on every PR:
1. `pnpm lint`
2. `pnpm check-types`
3. `pnpm build`
4. `pnpm test`
