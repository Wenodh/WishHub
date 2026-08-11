# Deployment Guide

## Web Application (Next.js)
The web dashboard and API are designed for deployment on **Vercel**.
1. Connect the repository to Vercel.
2. Configure the following environment variables:
    - `DATABASE_URL` (PostgreSQL/Neon connection string)
    - `BETTER_AUTH_SECRET`
    - `BETTER_AUTH_URL` (Full URL of the deployed app)
3. Vercel will automatically detect the Turborepo workspace and build `apps/web`.

## Documentation (Fumadocs)
The documentation site is also optimized for Vercel.
1. Build command: `pnpm --filter docs build`
2. Output directory: `apps/docs/.next`

## Browser Extension (Vite)
The extension must be built and loaded manually or submitted to the Chrome Web Store.
1. Build: `pnpm --filter extension build`
2. The artifacts are generated in `apps/extension/dist`.
3. In Chrome: Navigate to `chrome://extensions`, enable Developer Mode, and "Load unpacked" from the `dist` folder.

## Production Checklist
- [ ] Run `pnpm db:push` (or migrations) to update the production database schema.
- [ ] Verify `BETTER_AUTH_URL` matches the production domain.
- [ ] Ensure `NODE_ENV=production`.
