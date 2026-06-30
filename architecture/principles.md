# Engineering Principles

These principles guide the development of WishHub and serve as guardrails for every contribution.

## 1. Domain-First Design
Business logic must be defined in framework-independent packages. Apps are simply delivery mechanisms for the domain logic.

## 2. Feature-Based Architecture
Organize code by feature (e.g., `wishlist`, `catalog`) rather than by technical type (e.g., `components`, `hooks`). This prevents the "spaghetti" effect as the project scales.

## 3. Composition Over Inheritance
Favor composition and functional patterns to share behavior. Avoid deep inheritance hierarchies.

## 4. Strict TypeScript
No `any`. No disabled ESLint rules. Every interface must be typed, and every function must have defined inputs and outputs.

## 5. Shared Contracts
All communication between clients (Web, Mobile, Extension) and the API must use shared Zod contracts defined in `packages/contracts`.

## 6. Repository Pattern
Data access must be abstracted via Repositories. Business logic should never interact directly with the database or ORM (Prisma).

## 7. Single Responsibility
Each package and module should have one clear responsibility. If a package "knows too much," it should be split.

## 8. Public API via index.ts
Only expose necessary functions, types, and constants through each package's root `index.ts`. Avoid deep imports into package internals.

## 9. No Business Logic in UI
UI components should only handle presentation and local state. All business logic must live in services or domain packages.

## 10. Framework Independence
The "Core" of WishHub should remain independent of Next.js, React, or Expo. This ensures the domain logic can be reused in any environment.
