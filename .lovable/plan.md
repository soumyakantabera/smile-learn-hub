# Final LMS Editor Upgrade — Implementation Plan

## Phase 1 — Data robustness
- `src/types/content.ts`: add `CourseStatus = 'draft' | 'published' | 'archived'` and `status?: CourseStatus` on `Course`.
- `src/lib/editorStorage.ts`: add `duplicateCourse`, `duplicateModule`, `duplicateItem`, `moveItem`, rolling localStorage snapshots (`lws_draft_snapshots`, keep last 5), `getDraftSizeKB`, `importDraftFromFile`, `diffContent` for draft-vs-production diff, and `getAllItemTags` helper.
- `src/contexts/EditorContext.tsx`: add in-memory undo/redo stack (limit 30), expose `duplicate*`, `moveItem`, `importContent`, `undo/redo`, `canUndo/canRedo`, `draftSizeKB`, `getSnapshots`, `restoreFromSnapshot`, plus `productionContent` for diffing.

## Phase 2 — Editor shell (`src/pages/Editor.tsx`)
- Breadcrumb trail (Home › Editor › current tab).
- Global keyboard shortcuts: Ctrl/Cmd+S (save), Ctrl/Cmd+Z (undo), Ctrl/Cmd+Shift+Z or Ctrl+Y (redo), with a "Keyboard shortcuts" help dialog.
- Toolbar: Undo/Redo buttons, snapshot menu, Import/Export JSON, Reset (now uses `ConfirmDialog`), Save Draft, **Publish** button.
- Replace `Snackbar` with `sonner` toasts.
- Draft size chip in KB.

## Phase 3 — Reusable components (new)
- `ConfirmDialog.tsx`, `EmptyState.tsx`, `TagAutocomplete.tsx` (MUI Autocomplete freeSolo), `PublishWizard.tsx` (diff summary + download), `QuizPreviewDialog.tsx` (wraps `QuizViewer`).

## Phase 4 — Authoring upgrades
- `QuizEditor.tsx`: drag-and-drop reorder for questions + "Take Quiz Preview" launching `QuizPreviewDialog`.
- `ItemEditor.tsx`: tag autocomplete, per-row Duplicate button, multi-select checkboxes with bulk **Move** (to another module) and **Delete**, live YouTube embed and PDF iframe preview inside the create/edit dialog, `ConfirmDialog`/`EmptyState`, sonner toasts.
- `ModuleEditor.tsx`: per-row Duplicate, quick-add inline input under each course, color-coded item-count badge, `ConfirmDialog`, sonner toasts.
- `CourseEditor.tsx`: per-card Duplicate, status field (`draft`/`published`/`archived`) with badge, search + status filter, live thumbnail preview, `ConfirmDialog`, sonner toasts.

## Phase 5 — Publishing flow
- New `PublishWizard.tsx`: shows diff vs production (`coursesAdded/Changed/Removed` etc.), explains "download index.json → replace `public/content/index.json` → commit/deploy", with a one-click Download button.
- `src/lib/content.ts`: `getBatchCourses` filters non-published courses for student batches (admin batch still sees everything).

## Phase 6 — Polish & a11y
- `aria-label` on all icon-only buttons and drag handles.
- Hover/transition states on course cards; success/warning color cues on empty modules.

## Files touched
- Edit: `src/types/content.ts`, `src/lib/editorStorage.ts`, `src/lib/content.ts`, `src/contexts/EditorContext.tsx`, `src/pages/Editor.tsx`, `src/components/editor/CourseEditor.tsx`, `src/components/editor/ModuleEditor.tsx`, `src/components/editor/ItemEditor.tsx`, `src/components/editor/QuizEditor.tsx`.
- Create: `src/components/editor/ConfirmDialog.tsx`, `EmptyState.tsx`, `TagAutocomplete.tsx`, `PublishWizard.tsx`, `QuizPreviewDialog.tsx`.

## Out of scope
- Backend persistence / Lovable Cloud (kept on localStorage).
- Markdown rich text (deferred — `react-markdown` not currently installed).
- Real-time multi-user editing or student progress tracking.

## Dependencies
- None added. Uses installed MUI Autocomplete, `sonner`, existing `recharts`.

All code for these changes is already drafted and ready to write — approving this plan will apply it in build mode.