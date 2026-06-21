## Mobile Layout Audit — Findings & Fixes

Scope: every student/admin page on phone viewports (≤ md). All work is in presentation code; no business logic touched.

### Issues found

1. **Bottom content hidden behind floating bars.** `AppLayout` uses one blanket `pb: { xs: 12 }` (96 px) for every page. On the Viewer the floating `ItemNavBar` plus 56-px `MobileBottomNav` plus iOS safe-area can reach ~180 px, so the last paragraph / "Finish" button gets covered. On non-viewer pages 96 px is more than needed, producing a dead gap above the bottom nav.

2. **Phantom 56-px gap below `ItemNavBar` on Viewer (mobile).** `MobileBottomNav` is hidden on `/view/*`, but `ItemNavBar` is still pinned to `bottom: 56` for `xs`, so it floats with a visible gap and content peeks underneath. The spacer `<Box height: 140>` in `Viewer.tsx` is a magic number that no longer matches.

3. **`100vh` causes Safari/Chrome address-bar clipping.** Outer `Box` and main `Box` in `AppLayout`, plus `Login`, `ProtectedRoute`, `NotFoundPage`, all use `minHeight: '100vh'`. On mobile this overshoots the visible area when the URL bar collapses, leaving a strip you can't scroll past on short pages, and triggers the "no vertical scroll" feeling on Dashboard when content is just under viewport.

4. **Horizontal scroll risk from `PageHeader` and `ItemDotsStrip`.** `PageHeader` breadcrumb `Stack` does not constrain width; long titles overflow the viewport on 360-px screens because `Chip` `maxWidth: 160` plus the icon tile plus action buttons can exceed 100 vw. The header's outer `Paper` lacks `overflow-x: hidden` on the wrapper, so the document body picks up an `overflow-x` scrollbar.

5. **`PageHeader` actions / meta row stacks awkwardly on mobile.** On `Editor.tsx` the actions slot holds 6 icon buttons + Save + Publish; with `direction: { xs: 'column', sm: 'row' }` they collapse below the title but get `gap: 1` only, producing wrap with uneven height and no horizontal scroll fallback.

6. **Drawer width = 260 px on a 360-px phone** leaves only a 38-px tap-out gutter. Combined with `<Toolbar />` content padding (xs: `p: 2` = 16 px each side) the layout feels cramped.

7. **AppBar height ≠ spacer height on short mobile.** `<Toolbar />` in main uses default `min-height`, but `AppBar` toolbar in landscape phones drops to 48 px; the spacer mismatch leaves a 8-px white strip under the bar.

8. **`pb` of 0 on Editor body** — `Editor.tsx` renders large tab panels that, on phones, push under the bottom nav because the Editor's own content already had its own padding.

### Fixes

**A. `src/components/AppLayout.tsx`**
- Replace `minHeight: '100vh'` with `minHeight: '100dvh'` (with `100vh` fallback) on both the outer flex `Box` and the main `Box`.
- Add `overflowX: 'hidden'` on the outer flex `Box` to kill stray horizontal scroll.
- Make the main content padding-bottom **route-aware**: read `useLocation()`; if path starts with `/view/`, use `pb: { xs: 'calc(180px + env(safe-area-inset-bottom))', md: 3 }`, else `pb: { xs: 'calc(80px + env(safe-area-inset-bottom))', md: 3 }`. Remove the magic `Box height: 140` spacer from `Viewer.tsx`.
- Mobile `Drawer` width: `min(300px, 86vw)` instead of fixed 260.
- Replace the manual `<Toolbar />` spacer with `theme.mixins.toolbar` `minHeight` so it auto-matches landscape/portrait toolbar heights.

**B. `src/components/MobileBottomNav.tsx`**
- Already returns `null` on `/view/*` — keep, but export a constant `MOBILE_BOTTOM_NAV_HEIGHT = 56` so `AppLayout` can reuse it.

**C. `src/components/viewer/ItemNavBar.tsx`**
- Mobile `Paper` uses `bottom: 0` (not 56). The route hides `MobileBottomNav`, so the nav bar sits flush above the safe-area. Keep `pb: env(safe-area-inset-bottom)`.
- Cap the Paper at `maxWidth: '100vw'` and add `overflowX: 'hidden'` to prevent the dots strip from leaking horizontally.

**D. `src/components/PageHeader.tsx`**
- Wrap the breadcrumb `Stack` in a `Box` with `overflowX: 'auto'`, `flexWrap: 'nowrap'`, and hide the scrollbar (`scrollbar-thin` class). Chips stay on one line and scroll horizontally if too long — standard app pattern.
- On `xs`, reduce icon tile from 56→44 px (force `compact` on small screens via `useMediaQuery`).
- Cap title with `wordBreak: 'break-word'` (already) and add `fontSize: { xs: '1.15rem', sm: '1.35rem' }`.
- Actions row on `xs`: `width: 100%`, `overflowX: 'auto'`, `flexWrap: 'nowrap'`, `-webkit-overflow-scrolling: touch`, so a long admin toolbar scrolls horizontally instead of stacking.

**E. `src/pages/Login.tsx`, `src/pages/NotFoundPage.tsx`, `src/components/ProtectedRoute.tsx`**
- Swap `minHeight: '100vh'` → `minHeight: '100dvh'`.

**F. `src/pages/Viewer.tsx`**
- Remove the conditional 140-px spacer (handled centrally in `AppLayout` now).
- Add `sx={{ maxWidth: '100%', overflowX: 'hidden' }}` on any iframe/video container that currently can overshoot (PDF iframe is 600 px tall, fine; verify with viewport-based `height: { xs: '70vh', md: 600 }`).

**G. `src/index.css`**
- Add a global safety rule:
  ```css
  html, body, #root { max-width: 100vw; overflow-x: hidden; }
  ```
  Prevents accidental horizontal scroll if any future child overflows.

### Out of scope
- No content-data or context/state changes.
- No editor logic, no auth, no navigation routes added.
- No new dependencies.

### Files touched
- `src/components/AppLayout.tsx`
- `src/components/MobileBottomNav.tsx`
- `src/components/PageHeader.tsx`
- `src/components/viewer/ItemNavBar.tsx`
- `src/pages/Viewer.tsx`
- `src/pages/Login.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/index.css`

### Verification
After build, drive Playwright at 390×674 to:
1. Scroll `/` to bottom — confirm last "Recently Added" card is fully visible above the bottom nav.
2. Scroll `/view/<item>` — confirm Finish button reachable, nav bar flush with safe-area.
3. Rotate viewport (drag the device toggle to tablet) — confirm no horizontal scrollbar appears on any route.
