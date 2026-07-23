# Database & Persistence Layer Audit Report

## 1. Executive Summary
This report presents a comprehensive, read-only audit of WishHub's database and persistence layer architecture. All findings are derived statically from the codebase, environment variable configuration, schema files, documentation, and authentication configurations in the workspace.

Overall, the data architecture follows clean domain-driven principles (specifically separating global Product extraction from private user-specific Saves). However, a **critical risk** has been identified in the **Better Auth integration**: the Prisma schema defines a custom `User` table but lacks the standard schema models/tables (like `Session`, `Account`, and `Verification`) required by Better Auth's `prismaAdapter`. This will lead to runtime failures when attempting to register, log in, or retrieve auth sessions.

---

## 2. Database Provider
*   **Active Database Provider**: PostgreSQL.
*   **Intended Host**: **Supabase** (as verified by references in `docs/DATABASE.md`, `docs/DEPLOYMENT.md`, and Supabase-specific environment variables in `@wishhub/env`).
*   **Database Initializer**: `packages/database/src/index.ts`.
    *   It instantiates a singleton `PrismaClient` and exports the `prisma` client.
    *   In development and preview modes (`process.env.NODE_ENV !== "production"`), it binds the client instance to the NodeJS global context object (`globalThis.prisma`) to prevent connection pool exhaustion during Next.js hot-reloads.
    *   In production, logging is limited to `['error']` for performance, whereas development logs `['query', 'error', 'warn']`.

---

## 3. Prisma Configuration & Schema Overview
### Schema Location
The active schema is located at: `packages/database/prisma/schema.prisma`.

### Migration Strategy
*   The project does **not** contain a `prisma/migrations` directory.
*   Instead, the project adopts a **push-based development workflow** using **`prisma db push`**.
*   This is confirmed by:
    1. The presence of the `"db:push": "prisma db push"` script in `packages/database/package.json`.
    2. Instructions in `docs/DEPLOYMENT.md` prompting developers to run `pnpm db:push` to update the production database schema.
*   **Implication**: There are no traditional SQL migration files. The schema structure is synchronized directly against the target database connection string.

### Prisma Schema Models Detail
The active Prisma schema defines the following **8 models**:

| Model Name | Table Name (Implicit) | Description / Purpose |
| :--- | :--- | :--- |
| **`User`** | `User` | Stores standard user account information (ID, email, optional profile name/image, and timestamps). |
| **`CatalogProduct`** | `CatalogProduct` | Represents unique global products parsed by the scrapers. Uniquely identified by `canonicalUrl` (under an index for fast lookups). Stores store-specific names, images (JSON list), description, brand, and optional metadata. |
| **`ProductInsight`** | `ProductInsight` | Stores AI-generated product analysis linked to `CatalogProduct`, including summaries, parsed lists of pros/cons, and buy recommendations. Optimized with a unique compound index on `[catalogProductId, promptVersion]`. |
| **`ProductTag`** | `ProductTag` | Represents tags associated with a global catalog product for classification. Compound indexed on `[catalogProductId, name]`. |
| **`AIJob`** | `AIJob` | Represents background processing queue entries for AI generation tasks. Tracks job state, attempts, lock times, and processing costs/errors. |
| **`SavedProduct`** | `SavedProduct` | Join table connecting a `User` to a global `CatalogProduct`. Contains user-owned properties (e.g., archived status and original input URL). Indexed for fast individual user dashboard lookups. |
| **`Wishlist`** | `Wishlist` | Folders created by users to group saved products. Defaults to a single system-generated list (`isDefault: true`) and enforces unique wishlist naming per user. |
| **`WishlistItem`** | `WishlistItem` | Composite join table linking a `Wishlist` to a `SavedProduct` (composite primary key `[wishlistId, savedProductId]`). Prevents the same saved item from being added to a single list twice. |

---

## 4. Better Auth Audit
### Configuration Analysis
*   Better Auth is initialized in `packages/auth/src/index.ts`.
*   It is configured to use the `prismaAdapter` pointing to the internal database's `prisma` client.
*   The authentication provider uses `postgresql` with standard `emailAndPassword` credentials flow.

### Critical Discrepancies
Better Auth's default Prisma adapter expects several relational database tables/models to persist authentication flows and sessions. However, the current `packages/database/prisma/schema.prisma` is missing these schemas:
1.  **Missing `Session` Model**: Expected to manage logged-in sessions (token, expiresAt, userId, etc.).
2.  **Missing `Account` Model**: Expected to manage OAuth provider details and credential links.
3.  **Missing `Verification` Model**: Expected for email confirmation, password resets, etc.

*   **Impact**: Better Auth will throw runtime errors at startup or during execution (e.g., when attempting to fetch sessions at `/api/auth/get-session` or when processing sign-ins at `/api/auth/[[...all]]`) because the target database tables `Session`, `Account`, and `Verification` do not exist, and Prisma Client has no matching schema models.
*   **Authentication Data Persistence**: Currently, authentication persistence is **non-functional** at runtime due to these missing schema definitions.

---

## 5. Application Data Storage Mapping

The application's logical data concepts map directly to the database layer as follows:

| Logical Data Concept | Target Prisma Model | Database Table | Storage Format / Details |
| :--- | :--- | :--- | :--- |
| **Users** | `User` | `User` | Table-backed. Holds ID, email, name, image, and timestamps. |
| **Sessions** | *Missing* | *Missing* | N/A (Requires the Better Auth `Session` model). |
| **Wishlists** | `Wishlist` | `Wishlist` | Table-backed. Grouped by `userId` and unique name. |
| **Products** (Global) | `CatalogProduct` | `CatalogProduct` | Table-backed. Stores core properties like `canonicalUrl`, `brand`, and `title`. |
| **Saved Products** (User) | `SavedProduct` | `SavedProduct` | Table-backed. Holds user specific properties (`archivedAt`, `originalUrl`). |
| **Collections** | `Wishlist` | `Wishlist` | Managed via the default/custom folders in the `Wishlist` table. |
| **AI Insights** | `ProductInsight` | `ProductInsight` | Table-backed. JSON-formatted lists of pros/cons, and metadata. |
| **Price History** | `CatalogProduct` | `CatalogProduct` | Tracked catalog-centrically and currently mapped within the JSON `metadata` field of the `CatalogProduct` table, as no dedicated price snapshot table exists in schema. |
| **Background Jobs** | `AIJob` | `AIJob` | Table-backed. Tracks queued AI insights generation. (Price tracking cron tasks are managed via scheduled background alarms/scripts). |

---

## 6. Environment Variables
Server and client-side configurations are strictly defined and validated at application startup inside the `@wishhub/env` package using `@t3-oss/env-nextjs`.

### Required Variables Checklist

#### Server-Side Environment Variables
*   `DATABASE_URL` (Required, must be valid URL): Supabase connection pool string for database operations.
*   `DIRECT_URL` (Optional, must be valid URL): Direct connection string used to bypass pooling during migrate/push operations.
*   `BETTER_AUTH_SECRET` (Required): Secret key used to encrypt and sign Better Auth cookies.
*   `BETTER_AUTH_URL` (Required, must be valid URL): Canonical URL of the deployed application API gateway.
*   `SUPABASE_SERVICE_ROLE_KEY` (Required): Secret key for Supabase administrative operations.

#### Client-Side Environment Variables
*   `NEXT_PUBLIC_SUPABASE_URL` (Required): Public gateway URL for Supabase bucket assets/storage.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Required): Public anonymous key for Supabase asset access.
*   `NEXT_PUBLIC_APP_URL` (Required): Public frontend URL of the Next.js application.

### Sandbox Fallbacks & Dev Defaults
*   In development (`NODE_ENV=development`), environment variables are read from `.env` or system variables.
*   A `.env.example` is located in the repository root as the single source of truth for local configuration setups.
*   No insecure hardcoded fallbacks exist in the server configuration code.

---

## 7. Production Deployment Readiness
### Deployment Strategy
*   **Build Pipeline**: Runs on Vercel (Next.js server-side hosting).
*   **Database Sync**: Handled via `pnpm db:push` prior to or during release pipelines.
*   **Preview Environments**:
    *   Currently, preview environments share the same database configuration as production unless separate environment variables (`DATABASE_URL`, `DIRECT_URL`) are scoped manually in Vercel to use isolated staging/preview database branches.
    *   *Warning*: Sharing the database across preview deploys could result in dirty tests, data contamination, or schema conflicts if schema alterations are pushed in PR previews.

---

## 8. Seed & Test Data
*   **Seed Script**: A script file exists at `scripts/seed.ts`.
*   **Active Status**: **Incomplete / Empty (0 Bytes)**.
*   **Dependency**: The application has no functional startup dependencies on seed scripts. There is currently no code within the script to populate initial users, wishlists, or catalog products.

---

## 9. Risks, Issues & Security Concerns

### 1. Critical Discrepancy: Missing Better Auth Models in Schema (Severity: High)
*   **Evidence**: `packages/database/prisma/schema.prisma` contains no models for `Session`, `Account`, or `Verification`.
*   **Impact**: Runtime crash during authentication requests. The Prisma adapter cannot find the expected models on the Prisma client object, preventing registration, login, and session validations.

### 2. Missing Database Migration History (Severity: Medium)
*   **Evidence**: Absence of a `prisma/migrations` folder and reliance on `db:push` for changes.
*   **Impact**: Altering tables in production via `db:push` can lead to accidental data loss or drift. There is no version-controlled record of SQL modifications over time.

### 3. Shared Preview Environment Database (Severity: Medium)
*   **Evidence**: Setup guide assumes sharing the single Supabase instance.
*   **Impact**: Preview branches executing `db:push` can alter the production database schema destructively, or preview test-runs can pollute production user data.

### 4. Empty Seeding Script (Severity: Low)
*   **Evidence**: `scripts/seed.ts` is 0 bytes.
*   **Impact**: Difficult onboarding experience for developers or testing environments since no catalog products, users, or wishlists are populated out-of-the-box.

---

## 10. Recommended Fixes

### Severity: High
1.  **Extend `schema.prisma` with Better Auth Models**:
    Define standard Better Auth models in `packages/database/prisma/schema.prisma` to align with the PostgreSQL prismaAdapter:
    ```prisma
    model Session {
      id        String   @id @default(cuid())
      userId    String
      user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
      token     String   @unique
      expiresAt DateTime
      ipAddress String?
      userAgent String?
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
    }

    model Account {
      id                    String    @id @default(cuid())
      userId                String
      user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
      accountId             String
      providerId            String
      accessToken           String?
      refreshToken          String?
      idToken               String?
      accessTokenExpiresAt  DateTime?
      refreshTokenExpiresAt DateTime?
      scope                 String?
      password              String?
      createdAt             DateTime  @default(now())
      updatedAt             DateTime  @updatedAt
    }

    model Verification {
      id         String   @id @default(cuid())
      identifier String
      value      String
      expiresAt  DateTime
      createdAt  DateTime @default(now())
      updatedAt  DateTime @updatedAt
    }
    ```
    Ensure the `User` model matches with corresponding relations:
    ```prisma
    model User {
      // Existing fields ...
      sessions      Session[]
      accounts      Account[]
    }
    ```

### Severity: Medium
2.  **Transition to Prisma Migrations**:
    For robust deployment tracking and production protection, migrate from `db:push` to formal migrations:
    *   Create a baseline migration.
    *   Commit generated SQL migration scripts into the repository in `packages/database/prisma/migrations`.
3.  **Isolate Preview Databases**:
    Configure Vercel Environment Variable Scopes to provide distinct `DATABASE_URL` configurations for Production and Preview branches. Consider utilizing Supabase's database branching feature or separate Neon/local PostgreSQL dev instances.

### Severity: Low
4.  **Implement `scripts/seed.ts`**:
    Develop standard fake data insertion scripts (e.g., using `@faker-js/faker` or mock catalog items) inside `scripts/seed.ts` to allow rapid, predictable environment boots.
