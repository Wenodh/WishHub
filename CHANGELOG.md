# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-06-29

### Added

- **Infrastructure**: Initialized Turborepo monorepo with pnpm workspaces.
- **Shared Config**: Centralized ESLint, Prettier, TypeScript, and Tailwind configurations in `@wishhub/config`.
- **Core Package**: Created `@wishhub/core` for DDD primitives.
- **Environment**: Implemented type-safe environment variable management in `@wishhub/env`.
- **Database**: Set up `@wishhub/database` with Prisma and initial PostgreSQL schema.
- **Auth**: Configured `@wishhub/auth` with Better Auth and Prisma adapter.
- **UI**: Established `@wishhub/ui` design system with core components.
- **Applications**: Initialized apps for Web (Next.js), Docs (Fumadocs), Extension (Vite), and Mobile (Expo).
- **Architecture**: Comprehensive documentation including ADRs, roadmap, and technical debt register.

## [1.0.0] - 2026-07-14

### Added
- **Multi-Wishlist Support**: Users can now organize products into multiple custom collections.
- **Production-Ready Extension**: Enhanced browser extension with background sync, offline queue, and robust duplicate detection.
- **Price Tracking Foundation**: Integrated new scalable data model separating global Catalog products from user Saved products.
- **Performance**: Optimized dashboard load times and extension startup (<200ms) with stale-while-revalidate caching.
- **Accessibility**: Achieved WCAG 2.2 AA targets across web and extension platforms.
- **Security**: Hardened authentication (Better Auth) and ownership-based authorization.
- **Documentation**: Comprehensive technical docs for API, Database, Performance, and Security.

### Changed
- **Architecture**: Implemented "single-scrape, many-users" price tracking model (ADR 004).
- **Tooling**: Standardized telemetry and structured logging across the monorepo.

## [0.2.0] - 2025-07-02

### Added
- **Milestone 1A**: First end-to-end vertical slice completed.
- **Extension**: Full Amazon product extraction and saving flow.
- **Dashboard**: Web dashboard for viewing and deleting saved products.
- **API**: Standardized product endpoints with session and Zod validation.
- **Persistence**: Implemented `SavedProduct` repository and services.

### Changed
- **Framework**: Upgraded Next.js to **v16.2.10** to resolve security vulnerabilities (CVE-2025-29927).
- **Tooling**: Standardized React versions and ESLint configurations across the monorepo.
