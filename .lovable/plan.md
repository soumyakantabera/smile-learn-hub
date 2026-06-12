# Student Navigation Overhaul

Goal: Let students fluidly move through course content with Previous/Next buttons, in-context module outlines, and a polished navigation experience on both desktop and mobile.

---

## 1. Sequence helper (new) — `src/lib/contentNavigation.ts`

Single source of truth for "what comes next" so all pages agree.

- `buildCourseSequence(content, courseId)` → flat ordered array `[{ item, module, indexInCourse }]` covering every item in every module (modules sorted by `order`, items in stored order).
- `getAdjacentItems(content, itemId)` → `{ prev, next, current, sequence, course, module }`. Handles cross-module jumps (last item of module N → first item of module N+1) and returns `null` for ends.
- `getItemPosition(sequence, itemId)` → `{ index, total }` for "12 of 34" labels.

No business-logic changes; pure read helpers using existing `getCourse / getCourseModules / getModuleItems`.

## 2. Viewer page — `src/pages/Viewer.tsx`

Add a sticky/responsive navigation bar both above and below the content:

- **Top bar (compact):** Back to module button, progress chip `Item 12 / 34`, linear progress bar of position in course.
- **Bottom bar (primary action):**
  - Left: `← Previous` button showing prev item title (truncated). Disabled at start.
  - Right: `Next →` button showing next item title. Disabled at end; when at end show `Finish course` linking back to course page.
  - Middle (desktop only): "Module: X" chip.
- Mobile: bottom bar becomes a fixed `Paper` pinned to viewport bottom (`position: fixed`, `bottom: 0`) with safe-area padding, two equal-width buttons, swipeable feel. Add bottom spacing on main content so fixed bar doesn't overlap.
- Desktop (≥ md): inline (not fixed) below the viewer, full width inside content column.
- Keyboard shortcuts: `←` / `→` (also `J`/`K`) navigate prev/next when not focused in an input/textarea/contenteditable.
- "Up to module" link on breadcrumb already exists — also add an `ArrowUpward` button in the top bar that returns to module page on mobile (since breadcrumbs are cramped).

## 3. Module page — `src/pages/ModuleDetail.tsx`

- Add **Previous module / Next module** buttons at the bottom (uses `course.modules` order).
- Add **"Continue where you left off"** affordance: if the URL has `?from=item-id` (set when leaving Viewer via Back), scroll/highlight that row.
- Make item rows more tappable on mobile: bigger touch target, secondary line wraps, tag chips hide below `sm`.

## 4. Course page (`src/pages/CourseDetail.tsx`) — light touch only

- Add a "Start course" / "Resume" button that links to the first item of the first module (uses new sequence helper). Keeps existing layout.

## 5. Module outline drawer (new, viewer only)

On Viewer page add a "Module outline" button (icon `ListAlt`):
- **Desktop (≥ md):** opens a right-side `Drawer` (320 px) listing all items in the current module with the active item highlighted and clickable to jump.
- **Mobile:** same drawer but `anchor="bottom"` with a 75-vh sheet, swipe-to-close.

This gives students contextual navigation without leaving the viewer.

## 6. App-wide mobile polish — `src/components/AppLayout.tsx`

- Add a **bottom navigation bar on mobile** (`BottomNavigation` from MUI) with Dashboard / Courses / Help (admin sees Editor too via overflow). Visible only `xs..sm`, hidden on `md+`. Sidebar still works via hamburger; bottom nav makes the most common destinations one tap away.
- Increase main content bottom padding on mobile so it clears the bottom nav and the Viewer's fixed prev/next bar.
- Keep AppBar title showing current page; on Viewer, replace title with truncated item title for context.

## 7. Files

**New**
- `src/lib/contentNavigation.ts`
- `src/components/viewer/ItemNavBar.tsx` (top + bottom bar variants, reused)
- `src/components/viewer/ModuleOutlineDrawer.tsx`
- `src/components/MobileBottomNav.tsx`

**Edited**
- `src/pages/Viewer.tsx` — wire ItemNavBar, ModuleOutlineDrawer, keyboard shortcuts, mobile spacing
- `src/pages/ModuleDetail.tsx` — prev/next module, mobile-friendly rows, highlight-from-query
- `src/pages/CourseDetail.tsx` — Start/Resume button
- `src/components/AppLayout.tsx` — mount MobileBottomNav, adjust bottom padding

## 8. Out of scope

- Persisting per-student progress (no backend yet) — "Resume" uses last item visited via `localStorage` only as a non-blocking enhancement.
- Changing the editor pages.
- Swipe gestures beyond what MUI Drawer provides natively.

## 9. Technical notes

- Use MUI `useMediaQuery(theme.breakpoints.down('md'))` for breakpoint branching, matching existing pattern in `AppLayout`.
- Fixed bottom bar uses `paddingBottom: 'env(safe-area-inset-bottom)'` for iOS notch.
- Keyboard handler attaches in `useEffect` on Viewer only; checks `document.activeElement.tagName` to ignore inputs.
- All new components use existing MUI theme tokens — no custom colors.
