# UX Audit Report

## 1. Universal "Add Anything" & Fallback Core Experience

One of the cornerstone user journey designs in WishHub V1 is the guaranteed ability to save any product URL.

### URL Extraction Fallback Path
When a user inputs a URL to add a product, the platform triggers `/api/products/extract`.

- **Success State**:
  - Automatically parses title, images, description, brand, price, and currency.
  - Renders a clean visual preview card.
  - Allows the user to edit fields or select a target wishlist before saving.

- **Extraction Failure State**:
  - If a website blocks scrapers, times out, or contains zero microdata (OG/JSON-LD), the API returns `{ extracted: false }` along with the original URL.
  - The UI gracefully degrades to show a informative alert:
    > "We couldn't automatically find product details. Please fill in the details below to save."
  - This immediately exposes a beautiful input form allowing manual overrides for:
    - **Title** (Required)
    - **URL** (Prepopulated from original input)
    - **Price** (Optional)
    - **Currency** (Default or selected)
    - **Image URL** (Optional)
    - **Notes** (Optional)
    - **Wishlist** (Dropdown collection folder)
  - Submitting the manual form saves the product cleanly using the same API pipeline, ensuring a frictionless user journey.

---

## 2. Empty States, Loading, and Error Behaviors

- **Empty States**:
  - The main dashboard implements custom `EmptyState` cards with clear, supportive call-to-actions ("Create your first collection" or "Add a product using a URL").
- **Loading Indicators**:
  - Premium SaaS skeleton loaders are displayed while wishlists are being fetched or during product drawer transitions, avoiding jarring content shifts.
- **Error Boundaries**:
  - Next.js 15 error boundaries (`error.tsx`/`global-error.tsx`) are configured around dynamic segments with immediate retry recovery interfaces.
