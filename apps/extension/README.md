# WishHub Browser Extension

This package contains the WishHub browser extension, built with React, Vite, and Tailwind CSS.

## Styling and Tailwind CSS

The extension uses Tailwind CSS for styling. Since it is built as a self-contained unit with Vite, it must have its own Tailwind pipeline configured.

### Shared UI Components

If you are using components from `@wishhub/ui`, ensure that the `tailwind.config.js` includes the source path of the UI package so that its classes are correctly scanned and bundled:

```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
],
```

### Build Validation

To prevent regressions where the extension is built without styles, a `verify-build.js` script runs after the build process to ensure that a CSS bundle was successfully emitted to `dist/assets/`.

## Development

- `pnpm dev`: Start the development server
- `pnpm build`: Build the extension for production
- `pnpm test`: Run tests
