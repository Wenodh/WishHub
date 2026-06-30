# ADR 003: Data Flow

## Status

Accepted

## Context

Efficiently moving data from various sources (Extension, Web) to the database and ensuring all clients are synced.

## Decision

- **Extension** acts as the primary scraper using `packages/scraper`.
- **API** (Next.js Route Handlers) serves as the bridge, using `packages/contracts` for validation.
- **Domain Logic** lives in feature packages (e.g., `packages/catalog`, `packages/wishlist`).
- **Data Access** is abstracted via Repositories to decouple domain logic from Prisma.
- **State Management** uses TanStack Query (Web/Mobile) and Zustand.

## Consequences

- Clear separation of concerns.
- Testable business logic independent of infrastructure.
- Type-safe communication between client and server.
