# Milestone 1: Vertical Slice Architecture (Milestone 1A COMPLETED)

This document describes the request, data, and authentication lifecycles for the first end-to-end vertical slice: saving a product from the browser extension and viewing it in the web dashboard.

## 1. Request Lifecycle

1.  **Trigger**: User opens the extension popup on a product page.
2.  **Extraction**: The **Popup** sends a message to the **Content Script**. The Content Script uses `packages/scraper` to extract metadata and returns an `ExtractionResult`.
3.  **Preview**: The **Popup** displays the extracted data.
4.  **Save Action**: User clicks "Save". The **Popup** calls the `sdk.products.save()` method.
5.  **SDK**: The **SDK** validates the data using `packages/contracts` and sends a POST request to the **Web API**.
6.  **API Handler**: The **Next.js Route Handler** (`apps/web/api/products`) validates the session via `packages/auth`.
7.  **Service**: The handler calls `SaveProductService` (`packages/catalog`).
8.  **Normalization**: The service uses `UrlNormalizerService` to clean the URL.
9.  **Idempotency**: The service checks if the product already exists for the user. If yes, it returns the existing product.
10. **Persistence**: The service calls `ProductRepository` which uses **Prisma** to save the product and its images.
11. **Response**: The API returns the `ProductResponseDTO`.
12. **UI Update**: The extension shows a "Saved" state. The Web Dashboard (if open) will show the new product upon refresh or through TanStack Query invalidation.

## 2. Data Lifecycle

-   **DOM Metadata**: Volatile data extracted from HTML.
-   **ExtractionResult**: Structured DTO containing confidence scores and raw metadata.
-   **Domain Model**: Pure TypeScript objects in `packages/catalog` representing a Product.
-   **Prisma Model**: Database-specific representation.
-   **JSON Storage**: `rawMetadata` is stored as a JSON column for debugging and future AI processing.

## 3. Authentication Lifecycle

-   **Provider**: Better Auth handles session management.
-   **Abstraction**: The SDK uses an `AuthProvider` interface to handle token/cookie management.
-   **Validation**: Every API request is checked for a valid session.
-   **Ownership**: Repositories enforce `userId` checks for all read/write/delete operations.

## 4. Package Interactions

-   **`apps/extension`** -> `packages/scraper` (Logic)
-   **`apps/extension`** -> `packages/sdk` (Communication)
-   **`apps/web`** -> `packages/catalog` (Business Logic)
-   **`packages/catalog`** -> `packages/database` (Persistence)
-   **`packages/sdk`** -> `packages/contracts` (Validation)

## 5. Future Extension Points

-   **Adapters**: Site-specific parsers in `packages/scraper`.
-   **Events**: `SaveProductService` can emit a `ProductSaved` event for future price tracking or notifications.
-   **Images**: The schema supports multiple images per product.
