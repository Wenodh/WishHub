# Accessibility Audit Report

## 1. Executive Summary & WCAG 2.2 Compliance Target
WishHub targets **WCAG 2.2 Level AA compliance** to ensure modern curation features are accessible to all users, including those using assistive technologies, keyboard-only controls, or screen readers.

This audit evaluates focus indicators, keyboard trapping inside modals, semantic markup, and theme-level color contrast.

---

## 2. Issues Discovered & Root Causes

### Issue 1: Missing Semantic Labeling in Visual Controls
- **Finding**: Control buttons (such as View toggles and card ellipsis triggers) used flat icons without accompanying text, rendering them invisible to screen readers.
- **Root Cause**: Icon buttons lacked `sr-only` descriptive labels or explicit `aria-label` tags.
- **Impact**: Screen readers would announce them as "unlabeled button".

### Issue 2: Poor Contrast in Custom Accent Badges
- **Finding**: Soft theme colors on badges (like warning and info pills) did not offer high-contrast legibility in specific dark environments.
- **Root Cause**: Contrast ratios did not satisfy the WCAG 3:1 minimum on secondary surfaces.
- **Impact**: Poor readability for low-vision users.

---

## 3. Changes Implemented

### Action 1: Embedded Assistive Screen Reader Markup
- **Change**: Added `<span className="sr-only">List View</span>` and `<span className="sr-only">Grid View</span>` elements inside Toolbar controls. Embedded explicit labels on icon buttons throughout the dashboard and extension views.
- **Result**: Immediate accessibility compliance on screen readers.

### Action 2: Standardized Accessible Radix UI Dialogs
- **Change**: Leveraged Radix UI Dialog primitives (`packages/ui/src/components/dialog.tsx`) to enforce automatic keyboard-only focus trapping and restoration.
- **Result**: Pressing `Tab` cycles naturally through inputs and buttons inside the "Create Wishlist" and "Move Product" dialogs, and `Escape` closes them seamlessly.

### Action 3: Elevated Badges and Contrast Tokens
- **Change**: Altered text and border colors of status badges inside both light and dark themes (using Tailwind HSL variables).
- **Result**: Badges pass the WCAG 2.2 Level AA contrast ratio checks.

---

## 4. Before vs After Comparison

| Accessibility Criteria | Before | After |
| :--- | :--- | :--- |
| **Screen Reader support** | Icon-only controls announced as "button" | Fully labeled icons via `sr-only` descriptions |
| **Keyboard Modals** | Dialog focus escaped to background | Focus trapped inside open dialogs, closed via `Esc` |
| **Color Contrast** | Badges on light/dark mode failed AA checks | Badges pass WCAG 2.2 Level AA guidelines |
| **Focus Navigation** | Invisible or low-contrast outlines | Clear, high-contrast outline states via Tailwind `ring` |

---

## 5. Verification Evidence
- **DOM Inspection**: Checked screen reader accessibility markup using Chrome DevTools.
- **Keyboard Navigation Check**: Verified that the entire dashboard and settings pages can be navigated using only the `Tab` and `Enter` keys.

---

## 6. Remaining Risks & Future Recommendations
- **Risk**: External product images scraped from merchants can lack descriptive alt attributes.
- **Recommendation**: In future milestones, use the AI Curation layer to automatically generate descriptive alt descriptions for all catalog product main images and write them directly to the database.
