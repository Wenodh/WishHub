# Testing Guide

WishHub uses a multi-layered testing strategy to ensure reliability across the platform.

## Test Stack

- **Vitest**: Fast, modern test runner for unit and integration tests.
- **React Testing Library**: UI component testing.
- **Prisma**: Database integration tests using a test database.

## Running Tests

### All Tests
```bash
pnpm test
```

### Specific Package
```bash
cd packages/wishlist
pnpm test
```

### Web API Tests
```bash
cd apps/web
pnpm test
```

## Testing Patterns

### 1. Unit Tests
Located next to the code: `src/__tests__`. Focus on business logic in services and domain models.

### 2. Integration Tests
Focus on package interactions and database persistence. Repositories are tested against a real (or Dockerized) Postgres instance.

### 3. API Route Tests
Located in `apps/web/app/api/**/__tests__`. These mock the session and verify endpoint behavior, status codes, and response shapes.

## CI/CD Integration

Tests are automatically run on every Pull Request via GitHub Actions. A failure in any test suite blocks merging.
