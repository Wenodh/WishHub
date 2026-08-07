# Production Launch Playbook

## 1. Context
This playbook details the step-by-step command orchestration to deploy WishHub v1.0 safely from development branches to high-availability production nodes on Vercel and Supabase.

---

## 2. Pre-Flight Checklist
1. Ensure all branch quality gates have passed (`check-types`, `lint`, and `test`).
2. Verify production secrets are correctly provisioned in Vercel environment configurations.
3. Confirm that CORS settings on Supabase restrict API access to the target web domain and Chrome Extension ID.

---

## 3. Step-by-Step Deployment Orchestration

### Phase A: Supabase Relational Migration
1. Set up connection strings for the high-performance Supabase PostgreSQL instance:
   ```bash
   export DATABASE_URL="postgresql://postgres:[password]@db.[supabase-project].supabase.co:5432/postgres"
   export DIRECT_URL="postgresql://postgres:[password]@db.[supabase-project].supabase.co:5432/postgres"
   ```
2. Propagate and synchronize database tables and schema structures:
   ```bash
   pnpm --filter @wishhub/database db:push
   ```
3. Seed default design-inspired catalog products and test accounts:
   ```bash
   pnpm --filter @wishhub/database db:seed
   ```

### Phase B: Web Platform Deployment (Vercel)
1. Link the repository to the designated Vercel project scope.
2. In the Vercel dashboard, verify the following variables are configured:
   - `BETTER_AUTH_SECRET`: Master signature salt.
   - `BETTER_AUTH_URL`: `https://wishhub.com`
   - `DATABASE_URL`: Pooling PostgreSQL connection string.
3. Trigger a production build on Vercel. Vercel automatically generates the Prisma Client and compiles optimized static assets using:
   ```bash
   pnpm --filter @wishhub/database db:generate && next build
   ```

### Phase C: Chrome Extension Distribution
1. Package the built Vite bundle located at `apps/extension/dist`:
   ```bash
   cd apps/extension && zip -r wishhub-extension-v1.zip dist/
   ```
2. Upload the zipped asset to the Chrome Web Store Developer Console for distribution.
