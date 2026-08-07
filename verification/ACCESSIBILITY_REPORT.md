# WishHub Accessibility Report (WCAG 2.2 AA)

## 1. Compliance Standard Target
WishHub targets **WCAG 2.2 Level AA compliance** to deliver a premium, accessible personal curation and shopping experience. All core interactive user paths on the dashboard, static pages, and the browser extension have been audited to assure inclusion across focus, screen-reader, and keyboard boundaries.

---

## 2. Accessibility Core Controls

### Labeled Controls & Semantic HTML
- **Icon Labels**: All controls utilizing icons (such as view toggles, grid/list triggers, delete buttons, and configuration options) are accompanied by screen-reader specific descriptions:
  ```tsx
  <span className="sr-only">List View</span>
  ```
- **Semantic Tags**: Semantic headers (`<h1>`-`<h6>`), lists, and page tags are structured correctly to permit seamless screen reader document parsing.

### Focus Management & Keyboard Navigation
- **Keyboard-Only Trapping**: Custom dialogs (such as "Create Wishlist" and "Move Product" modals) are built on top of Radix UI primitives. They naturally trap focus upon open, let users cycle through inputs via `Tab` / `Shift-Tab`, and support closing via the `Escape` key.
- **Focus Outlines**: Active elements (inputs, links, buttons) are styled with high-contrast outlines (such as Tailwind `ring` elements) visible in both light and dark mode backgrounds.

### Color Contrast legibility
- **HSL Contrast Rules**: Badge pill boundaries and helper text colors utilize Tailwind HSL tokens matching WCAG 2.2 4.5:1 ratio rules.
- **Dynamic Theme Support**: Theme toggles preserve color contrast criteria under both light and dark background environments.

---

## 3. Before vs After Comparison

| Accessibility Criteria | Audit State | Hardened State |
| :--- | :--- | :--- |
| **Screen Reader support** | Icon-only buttons announced "unlabeled" | Custom `sr-only` descriptive markup |
| **Keyboard Trapping** | Modal focus leaked to back layers | Standard Radix focus boundaries |
| **Escape Actions** | Modals had to be clicked to dismiss | Seamlessly dismisses modals on `Esc` keypress |
| **Outline States** | Low-visibility focus highlights | Clear, high-contrast outlines on tab focus |
