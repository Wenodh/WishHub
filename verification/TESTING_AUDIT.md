# Testing Audit

## 1. Testing Framework Integration
The testing strategy is detailed in `docs/TESTING.md` and uses two primary tools:
- **Vitest**: Used for running fast unit and integration tests across packages (such as checking normalizer and scraper behaviors).
- **Playwright**: Used for running end-to-end browser automation flows on `apps/web` (such as verifying user logins, wishlist creation, and product saves).

---

## 2. Test Execution Coverage

```
/ (Root)
├── packages/scraper/__tests__/        # Scraper unit tests
├── packages/catalog/__tests__/        # Catalog integration tests
├── packages/wishlist/__tests__/       # Wishlist service tests
└── apps/extension/src/__tests__/     # Extension storage tests
```

### Coverage Review
- **Scraper Normalizers**: `90%+` coverage. Highly robust tests verify tracking parameter removal and site-specific URL cleanup (such as Amazon product paths).
- **Domain Services**: `70%+` coverage. Service logic for wishlists and catalog operations is tested using mock databases.
- **Critical Testing Gaps**:
  1. **API Endpoints**: The REST controllers lack dedicated integration tests, meaning endpoints must be verified manually or through high-overhead Playwright runs.
  2. **Browser Extension Worker**: `background.ts` contains complex offline retry logic that is not covered by automated unit or integration tests.
  3. **AI Pipeline**: `packages/ai` contains mock provider tests but lacks integration tests to verify the behavior of the real `OpenAIProvider`.

---

## 3. Mocking Strategy Evaluation
- **Vitest Mocks**: Unit tests use mocks to isolate components and skip network requests. This keeps test runs fast and reliable.
- **Database Mocks**: Relational services use Prisma client mocks. While this keeps tests fast, it can fail to catch query errors that only occur on real PostgreSQL databases (such as transaction conflicts or invalid foreign keys).
- **Recommendation**: Run integration tests against a local PostgreSQL database using Docker or testcontainers to verify query behavior on a real database engine.
