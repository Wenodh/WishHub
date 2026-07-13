# Architecture Documentation

WishHub is a universal wishlist platform built with a modular, package-first architecture.

## Overview

The repository is a Turborepo monorepo that separates concerns into small, reusable packages.

### Core Principles
1. **Package First**: Logic should reside in `packages/` whenever possible.
2. **Domain Driven**: Business logic is separated into domains (Catalog, Wishlist).
3. **Thin Apps**: `apps/` (Web, Extension) should only handle UI and API orchestration.
4. **Contract Sharing**: Zod schemas in `@wishhub/contracts` ensure type safety between client and server.

## Repository Structure

### Applications (`apps/`)
- `web`: Next.js 15 app. Contains the dashboard, landing page, and REST API.
- `extension`: Vite-based browser extension.
- `mobile`: React Native (Expo) foundation.
- `docs`: Documentation site built with Fumadocs.

### Packages (`packages/`)
- `core`: Shared base classes and business primitives (`Result`, `BaseEntity`).
- `database`: Prisma client and schema definition.
- `auth`: Authentication logic using Better Auth.
- `catalog`: Product domain logic, repositories, and services.
- `wishlist`: Wishlist domain logic, repositories, and services.
- `scraper`: Web scraping orchestration and site adapters.
- `sdk`: Type-safe TypeScript client for the REST API.
- `ui`: Shared UI component library using Tailwind and Radix UI.
- `telemetry`: Observability, logging, and metrics.
- `contracts`: Shared Zod schemas and DTO types.

## Data Flow

See [Vertical Slice Guide](./vertical-slice.md) for a detailed trace of how data moves from the browser extension to the database.

## ADRs (Architecture Decision Records)

Major architectural decisions are documented in `architecture/decisions/`.
- [ADR 001: Monorepo](./decisions/ADR-001-monorepo.md)
- [ADR 002: Auth](./decisions/ADR-002-auth.md)
- [ADR 003: Data Flow](./decisions/ADR-003-data-flow.md)
