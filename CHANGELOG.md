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
