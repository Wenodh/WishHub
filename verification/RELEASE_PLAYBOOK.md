# WishHub V1 — Release Playbook & Troubleshooting Guide

## 1. Release Overview & Deployment Checklist
This playbook outlines the step-by-step procedure to safely deploy and certify WishHub V1 on the target production stack (Vercel + Neon PostgreSQL).

### Pre-Deployment Checklist
- [ ] Verify workspace-wide typechecking passes (`pnpm turbo check-types`).
- [ ] Verify linting rules pass with zero blocking errors (`pnpm lint`).
- [ ] Verify all Vitest unit and integration tests run green (`pnpm test`).
- [ ] Verify production Next.js and Extension builds succeed locally (`pnpm build`).
- [ ] Ensure all required production variables are provisioned in the Vercel dashboard.

---

## 2. Issues Discovered, Troubleshooting, and Mitigation Profiles
This section documents the specific issues audited, analyzed, and successfully resolved during the Milestone 4 verification phase.

### Issue A: ESLint Environment Crash (Ajv Version Mismatch)
* **Finding**: The ESLint execution broke with a TypeError: `Cannot set properties of undefined (setting 'ajv')`.
* **Evidence**:
  ```text
  TypeError: Cannot set properties of undefined (setting 'ajv')
  at Object.<anonymous> (/node_modules/eslint-config-turbo/index.js)
  ```
* **Severity**: `HIGH` (Blocked all CI/CD workflows and type checking).
* **Fix**: Restructured the root `package.json` pnpm overrides from `"ajv@<6.14.0": ">=6.14.0"` to `"ajv@<6.14.0": "^6.14.0"`. This allowed legacy packages to resolve to fully compliant, compatible Ajv 6.x versions rather than getting forced onto Ajv 8.x.
* **Verification**: `pnpm lint` and `pnpm check-types` now compile cleanly across all 26 packages.
* **Remaining Risk**: None. Resolved statically at the lockfile level.

### Issue B: JSDOM TypeScript Declaration Missing in App Route
* **Finding**: Production build failed on the server because `jsdom` typings could not be found under the Next.js Turbopack compiler.
* **Evidence**:
  ```text
  apps/web/app/api/products/extract/route.ts
  Error: Cannot find module 'jsdom' or its corresponding type declarations.
  ```
* **Severity**: `CRITICAL` (Blocked production Next.js compilation and Vercel builds).
* **Fix**: Moved `jsdom` from `devDependencies` to production `dependencies` in `apps/web/package.json` so that the Vercel build container correctly bundles it at compile and runtime. Verified that `@types/jsdom` is properly tracked.
* **Verification**: Running `pnpm build` successfully outputs highly optimized static/dynamic production pages for the Next.js web portal.
* **Remaining Risk**: None. Correctly bundled on the Vercel production server.

### Issue C: Tailwind CSS Configuration Module Type Mismatch
* **Finding**: Next.js Turbopack build issued warnings regarding Module format mismatch for the tailwind configuration module.
* **Evidence**:
  ```text
  web:build: Specified module format (EcmaScript Modules) is not matching the module format of the source code (CommonJs)
  in ./packages/config/tailwind/index.js
  ```
* **Severity**: `LOW` / `MEDIUM` (Noised up compilation logs, could lead to unexpected bundler resolution crashes on strict runtime platforms).
* **Fix**: Renamed `packages/config/tailwind/index.js` to `index.cjs` to explicitly declare its CommonJS nature to Turbopack, and updated the exports field in `packages/config/package.json`.
* **Verification**: Build warnings are completely resolved; compiling output is 100% clean.
* **Remaining Risk**: None.

### Issue D: Database Session Table Mismatches
* **Finding**: Running user signup with Better Auth threw unhandled relational execution crashes.
* **Evidence**:
  ```text
  Error: prisma.session is not defined on schema
  ```
* **Severity**: `CRITICAL` (Authentication was completely broken).
* **Fix**: Verified and updated `packages/database/prisma/schema.prisma` to include Better Auth's standard schema tables (`User`, `Session`, `Account`, and `Verification`) with complete cascading deletes.
* **Verification**: Playwright E2E Master Journey test correctly creates sessions, performs signup/login/logout, and survives browser reloads.
* **Remaining Risk**: None. Fully compliant with V1 Better Auth.

---

## 3. Recommended Production Migration Strategy
Currently, the database utilizes Schema Push (`prisma db push`) for development and local testing.

* **Warning**: Using `prisma db push` in production is a **HIGH RISK** because it can silently drop columns, indexes, or entire tables to sync the schema with the prisma definition file.
* **Recommendation**:
  1. For production deployment, transition to **Prisma Migrations** (`prisma migrate dev` locally, and `prisma migrate deploy` in Vercel's build pipeline).
  2. This creates incremental, trackable SQL migration scripts in a `prisma/migrations/` directory that can be audited, backed up, and safely run in transactions.

---

## 4. Environment Variables Reference (Vercel Production)
Ensure the following variables are configured in the Vercel environment. **Never commit, log, or share their actual secrets.**

| Name | Type | Purpose | Example / Pattern |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Server | Production Neon Connection String | `postgresql://user:pass@ep-pool.neon.tech/dbname?sslmode=require` |
| `DIRECT_URL` | Server | Direct connection string for DDL migrations | `postgresql://user:pass@ep-direct.neon.tech/dbname?sslmode=require` |
| `BETTER_AUTH_SECRET` | Server | Secure random cryptographic salt for sessions | `[A-Za-z0-9+/]{32,}` |
| `BETTER_AUTH_URL` | Server | Deployment URL used for cookie origin matching | `https://wishhub.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Client | Standard portal base URL for redirections | `https://wishhub.vercel.app` |
| `SKIP_ENV_VALIDATION` | Server | Bypasses non-critical env checks during builds | `true` |
