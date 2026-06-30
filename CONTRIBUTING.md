# Contributing to WishHub

Thank you for contributing to WishHub! Follow these guidelines to ensure a smooth and productive development experience.

## Branching Model
- `main`: Production-ready code.
- `develop`: Ongoing feature integration.
- `feature/*`: New features.
- `bugfix/*`: Bug fixes.
- `docs/*`: Documentation updates.

## Commit Message Format
We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation only changes.
- `style`: Changes that do not affect the meaning of the code.
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `build`: Changes that affect the build system or external dependencies.
- `ci`: Changes to CI configuration files and scripts.
- `chore`: Other changes that don't modify src or test files.

## Pull Request Checklist
1. Ensure the monorepo builds: `pnpm build`
2. Run linting: `pnpm lint`
3. Run type checking: `pnpm typecheck`
4. Update documentation if necessary.
5. Provide a clear description and screenshot (if applicable).

## Coding Standards
- Use **Strict TypeScript**. No `any`.
- Business logic belongs in **packages**, not in apps or UI components.
- Use **Feature-Based Architecture**.
- Prefer **composition over inheritance**.
- Follow **Domain-Driven Design (DDD)** where appropriate.

## Adding a New Package
1. Create a new directory in `packages/`.
2. Add `package.json` with `@wishhub/` prefix.
3. Add `tsconfig.json` extending `@wishhub/config/typescript/base.json`.
4. Register the package in the root `pnpm-workspace.yaml` (if not already covered by glob).
5. Add a `README.md`.

## Adding a New App
1. Create a new directory in `apps/`.
2. Ensure it consumes shared logic from `packages/`.
3. Configure environment variables in `packages/env`.
