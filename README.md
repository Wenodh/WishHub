# WishHub — Milestone 2: Wishlists (v1.0.0-beta)

WishHub is a universal wishlist platform that helps you organize products from across the web in one beautiful place.

[![CI](https://github.com/wishhub/wishhub/actions/workflows/ci.yml/badge.svg)](https://github.com/wishhub/wishhub/actions/workflows/ci.yml)

## 🚀 Key Features

- **One-Click Save**: Add products from any store using our browser extension.
- **Deep Extraction**: Automatically captures price, title, and high-quality images.
- **Multi-Wishlist**: Organize your saves into custom collections.
- **Instant UI**: Zero-latency dashboard with optimistic updates.
- **Developer First**: Built with a clean, package-based monorepo architecture.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router), React 19
- **Monorepo**: Turborepo, pnpm
- **Database**: Prisma, PostgreSQL (Supabase)
- **Auth**: Better Auth
- **Styling**: Tailwind CSS, Radix UI
- **Language**: TypeScript

## 📦 Monorepo Overview

| Package/App | Description |
|---|---|
| [`apps/web`](./apps/web) | Next.js Dashboard & REST API |
| [`apps/extension`](./apps/extension) | Vite-based Chrome Extension |
| [`packages/scraper`](./packages/scraper) | Product extraction engine |
| [`packages/sdk`](./packages/sdk) | Type-safe API client |
| [`packages/ui`](./packages/ui) | Shared design system |

## 🚦 Getting Started

### Prerequisites
- Node.js 22+
- pnpm 9+
- A running PostgreSQL instance (or Supabase project)

### Setup
1. Clone the repository.
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` and fill in the values.
4. Push database schema: `pnpm db:push`
5. Start development: `pnpm dev`

## 📖 Documentation
- [Architecture](./architecture/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Testing Guide](./docs/TESTING.md)
- [Security Policy](./docs/SECURITY.md)
- [Onboarding Guide](./docs/ONBOARDING.md)

## 🤝 Contributing
Please see our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
