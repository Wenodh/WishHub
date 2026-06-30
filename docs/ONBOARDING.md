# WishHub Developer Onboarding Guide

Welcome to WishHub! This guide will help you set up your local development environment.

## Prerequisites

- **Node.js**: >= 20 (Node 22 recommended)
- **pnpm**: >= 9.x
- **Docker**: For local PostgreSQL (optional, can use Supabase)

## Local Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd wishhub
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment Variables**:
   Copy `.env.example` to `.env` in the root (and individual apps if needed).
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure `DATABASE_URL` is set.*

4. **Initialize Database**:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   This will start all apps (Web, Docs, Extension, Mobile).

## Root Commands

- `pnpm build`: Build all apps and packages.
- `pnpm dev`: Start all apps in development mode.
- `pnpm lint`: Lint the entire monorepo.
- `pnpm typecheck`: Run TypeScript type checking.
- `pnpm format`: Format all files with Prettier.
- `pnpm db:generate`: Generate Prisma Client.
- `pnpm db:studio`: Open Prisma Studio.

## Architecture

Please refer to the [Architecture Documentation](./architecture/README.md) for detailed information on the project structure, ADRs, and diagrams.
