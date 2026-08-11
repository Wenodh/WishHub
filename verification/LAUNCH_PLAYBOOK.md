# High-Fidelity Launch Playbook & Safe Deployment Guide

This launch playbook governs the step-by-step release of WishHub V1.0 to staging and production environments.

---

## 1. Quality Checklist Gate
Before initiating any deployment, the following verification commands must run 100% green on your local or CI machine:

```bash
# 1. Install dependencies
pnpm install

# 2. Generate database prisma client
pnpm --filter @wishhub/database exec prisma generate

# 3. Validate typescript types across all 26 packages
pnpm run typecheck

# 4. Check lint compliance
pnpm lint

# 5. Run full test suite
pnpm test

# 6. Build optimized web and extension pipelines
pnpm build
```

---

## 2. Safe Database Deployment Strategy

Because this repository has no schema migration history (`prisma/migrations` folder) and relies on Schema Push during local iterations, **direct schema pushes must never be run against the live production Neon database**.

### Staged Production Migration Protocol
To safely synchronize database schemas without risking data loss:

1. **Verify No Breaking Schema Renovations**:
   - Confirm that any schema addition (such as new tables or nullable columns) is backwards-compatible.
   - Do not rename or delete populated columns.
2. **Execute Schema Generation Locally**:
   - Run local schema checks to ensure compatibility:
     ```bash
     pnpm --filter @wishhub/database exec prisma validate
     ```
3. **Establish Staging Environment Synchronization**:
   - Direct a schema push first to a Neon staging branch (created safely via the Neon dashboard):
     ```bash
     DATABASE_URL="postgresql://staging-user:pass@db-branch.neon.tech/postgres" pnpm --filter @wishhub/database exec prisma db push
     ```
4. **Synchronize Production Database**:
   - Run schema push against the production database only after testing is completed on the staging branch:
     ```bash
     DATABASE_URL="postgresql://prod-user:pass@db-prod.neon.tech/postgres" pnpm --filter @wishhub/database exec prisma db push
     ```

---

## 3. Platform Deployment Setup

### Step A: Better Auth Production Requirements
Before starting the Next.js server on Vercel, ensure the following environment variables are securely configured in the Vercel Dashboard:

1. `BETTER_AUTH_SECRET`:
   - Must be a high-entropy string generated with:
     ```bash
     openssl rand -base64 32
     ```
   - **Never use or fall back to default development secrets in production.**
2. `BETTER_AUTH_URL`:
   - Set to the canonical production domain (e.g., `https://wishhub.com`).
3. `DATABASE_URL`:
   - Set to the pooling Neon connection string (use connection pool port/param `-pooler` if necessary).
4. `DIRECT_URL`:
   - Set to the direct Neon non-pooling connection string.

### Step B: Build Target
The designated Vercel build command is:
```bash
pnpm --filter @wishhub/database db:generate && next build
```
This guarantees that Prisma Client bindings are fully generated and up to date before static site compilation starts.

### Step C: Chrome Extension Zip
To package the browser extension for Chrome Web Store submissions:
```bash
cd apps/extension
zip -r wishhub-extension-v1.zip dist/
```
Deploy the resulting zip file via the Chrome Web Store Developer Console.
