# ADR 001: Monorepo Structure

## Status

Accepted

## Context

WishHub needs to support multiple client applications (Web, Mobile, Browser Extension) while sharing significant amounts of business logic, types, and infrastructure code.

## Decision

We will use a Monorepo powered by Turborepo and pnpm.

The folder structure is organized into:

- `apps/`: End-user applications (Next.js, Expo, Vite).
- `packages/`: Reusable libraries and domain-specific logic.

## Consequences

- Improved code sharing and reusability.
- Simplified dependency management.
- Unified build and test pipelines.
- Slight increase in initial setup complexity.
