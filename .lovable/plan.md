
# Comprehensive Content Navigator + Visualizations + Module Cache

## Goals
1. Turn the existing prev/next bar into an app-like comprehensive **content navigator** that works on both desktop and mobile.
2. Add **richer visualizations** of course/module progress.
3. **Cache the last-opened module per course** in the browser so students resume in context, not just on the last item.

---

## 1. App-like Content Navigator (`ItemNavBar.tsx` rewrite)

Replace the simple Prev/Next paper with a multi-zone **sticky control bar** used on both desktop and mobile.

**Desktop (md+):** sticky to the bottom of the viewport (not just at the bottom of the page), full-width within the content column, three zones:
- Left: Prev tile (icon + "Previous" label + truncated title + module name as caption).
- Center: a **scrubbable item dots strip** — one dot per item in the course, current is enlarged & colored, completed dots filled, future dots outlined; hover shows a tooltip with item title/module/type icon. Clicking a dot jumps to that item. Auto-scrolls so current dot stays centered.
- Right: Next tile (mirrors Prev) or green "Finish course" when at end. Plus a compact "Outline" icon button that opens `ModuleOutlineDrawer`.

**Mobile (xs–sm):** fixed bottom sheet with two rows:
- Row 1: thin `LinearProgress` + "Module X · Item Y of N" + outline icon (top-right).
- Row 2: large Prev / Next buttons (icon-forward style, equal width, touch-target ≥48px). Swipe left/right on this bar triggers next/prev (use simple touchstart/touchend handler).
- Safe-area inset already handled; reuse and add `MobileBottomNav` offset so they stack cleanly.

**Shared:**
- Add a small **module label chip** above the prev/next titles ("In: Module 2 — Algebra").
- Add `aria-label`s, focus-visible rings, and `useHotkeys`-style ←/→ already exists.
- Add **"Up to module"** quick action (currently lives in the position toolbar) inside the bar's overflow menu, so the page-top toolbar can be slimmed.

## 2. Better Visualization

**A. CourseProgressRail (new `src/components/viewer/CourseProgressRail.tsx`)**
Render at top of the Viewer page, replacing the current "Item X of Y" Chip + flat LinearProgress block:
- Horizontal **segmented progress bar** — one segment per module, each subdivided into items. Current item segment glows; completed segments filled with primary color, future segments muted.
- Above bar: course title, "Module 2 of 5 · Item 7 of 23", elapsed-percentage chip.
- Click any segment → jump to that item.
- Compact mobile variant: stack module name + segmented bar only.

**B. ModuleDetail visualization**
- Add a **donut/ring progress** (MUI `CircularProgress` with custom label) showing items visited vs total items in the module, sourced from `getLastVisitedItem` history (extend storage — see §3).
- Add a "Next module" / "Previous module" card pair at the bottom (already exists from earlier work; keep, but restyle with arrows + thumbnails of first item type).

**C. CourseDetail visualization**
- Replace plain "Resume" button with a **resume card** showing: last visited module title, last item title, item type icon, % course complete (segmented mini-bar). Buttons: "Resume" (jumps to last item) and "Restart" (jumps to first item; clears last-visited).

## 3. Browser cache for last opened module

Extend `src/lib/contentNavigation.ts`:

```ts
const LAST_MODULE_KEY = 'lms:last-module';   // { [courseId]: moduleId }
const VISITED_ITEMS_KEY = 'lms:visited-items'; // { [courseId]: string[] }  // for visualization

export function rememberVisitedModule(courseId: string, moduleId: string) { ... }
export function getLastVisitedModule(courseId: string): string | null { ... }
export function markItemVisited(courseId: string, itemId: string) { ... }
export function getVisitedItems(courseId: string): Set<string> { ... }
```

Wire-up:
- `Viewer.tsx` `useEffect`: also call `rememberVisitedModule(course.id, module.id)` and `markItemVisited(course.id, itemId)`.
- `CourseDetail.tsx` resume button: prefer `getLastVisitedItem`; fall back to first item of `getLastVisitedModule`.
- `ModuleDetail.tsx`: read `getLastVisitedModule(courseId)` and if it equals current module, scroll to the last-visited item card.
- `Courses` list page (if applicable): show a "Continue" badge next to the course matching `getLastVisitedModule`.

All stored in `localStorage`; safe JSON parsing wrapped in try/catch (matching existing pattern). No backend changes.

## 4. Edits / new files

**New:**
- `src/components/viewer/CourseProgressRail.tsx`
- `src/components/viewer/ItemDotsStrip.tsx` (used by ItemNavBar center zone on desktop)
- `src/components/viewer/ResumeCard.tsx` (used by CourseDetail)

**Edited:**
- `src/components/viewer/ItemNavBar.tsx` — full rewrite per §1.
- `src/lib/contentNavigation.ts` — add module + visited-items cache.
- `src/pages/Viewer.tsx` — mount CourseProgressRail, slim position toolbar, write module + visited storage.
- `src/pages/CourseDetail.tsx` — swap Resume button for ResumeCard.
- `src/pages/ModuleDetail.tsx` — donut progress, restyle next/prev module cards, scroll to last-visited item.

## Out of scope
- No server-side progress (no Lovable Cloud changes).
- No content schema changes (no new fields on items/modules).
- No editor-side changes.
- No swipe library (uses native touch events only).

## Technical notes
- Reuse MUI `useMediaQuery(theme.breakpoints.down('md'))` for desktop/mobile split.
- Sticky-on-desktop nav bar: `position: sticky; bottom: 16px` inside the content scroll container; falls back to `position: fixed` on mobile (current behavior).
- Dots strip uses CSS `scroll-snap` + `ref.scrollIntoView({ inline: 'center', behavior: 'smooth' })` on item change.
- All visualizations driven by `buildCourseSequence` (already exists) — no extra data fetches.
