

# Advanced LMS Editor - Complete UI/UX Overhaul

## Overview
Transform the current basic editor into a professional-grade LMS content management system with a modern, dynamic UI, advanced interactive content creation tools, and polished UX across all editor tabs.

---

## 1. Editor Page Redesign (`Editor.tsx`)

**Current state:** Simple tab bar with basic header.

**Changes:**
- Replace flat tab bar with a **sidebar-based editor navigation** using a collapsible left panel (MUI Drawer) with icon+label nav items, keeping the main app sidebar intact
- Add a **sticky toolbar** at the top with Save, Export, Reset, Undo/Redo buttons and a live status indicator (draft/saved/publishing)
- Add a **global search bar** in the editor header to quickly find any course, module, or item by name
- Add **keyboard shortcuts** display (Ctrl+S to save, Ctrl+Z undo) via a help tooltip
- Add a **breadcrumb trail** showing current context (e.g., Editor > Courses > Communicative English)

## 2. Enhanced Dashboard (`EditorDashboard.tsx`)

**Current state:** Static stat cards and simple lists.

**Changes:**
- Replace static percentage bars with **animated Recharts bar/pie charts** for content distribution (Recharts is already installed)
- Add a **quick actions grid**: Create Course, Create Module, Add Item, Import Content -- as icon cards
- Add **content health indicators**: items missing URLs, quizzes with no questions, modules with 0 items
- Add a **recent activity timeline** with icons showing what was last created/edited
- Add **storage usage indicator** showing localStorage draft size

## 3. Advanced Course Editor (`CourseEditor.tsx`)

**Current state:** Card grid with basic create/edit dialog.

**Changes:**
- Add **inline editing** -- click course title to edit in-place without opening a dialog
- Add **thumbnail preview** in the create/edit dialog with a live preview as URL is typed
- Add **course duplication** button (clone a course with all modules and items)
- Add **batch assignment** directly in course cards (multi-select chips)
- Add a **course status** field (Draft/Published/Archived) with color-coded badges
- Add **search and filter** bar at the top (by category, level, status)

## 4. Advanced Module Editor (`ModuleEditor.tsx`)

**Current state:** Accordion list with drag handles.

**Changes:**
- Add **visual drag-and-drop** with a highlighted drop zone and smooth animation (CSS transitions on reorder)
- Add **module duplication** (clone with all child items)
- Add **collapse/expand all** button
- Add **item count badge** with color coding (green if has content, amber if empty)
- Add **inline quick-add** -- a text field at the bottom of each module to quickly create a new item by title

## 5. Advanced Item Editor & Interactive Content Maker (`ItemEditor.tsx`)

This is the biggest upgrade -- turning it into a true **content creation studio**.

**Current state:** Basic form dialog with type-dependent fields.

**Changes:**
- **Stepper-based creation wizard**: Replace single dialog with a multi-step form:
  - Step 1: Choose type (visual icon grid, not dropdown)
  - Step 2: Content details (title, description, tags)
  - Step 3: Type-specific configuration (URL, embed, quiz builder, etc.)
  - Step 4: Preview and confirm
- **Rich type selector**: Large clickable cards with icon, label, and description for each content type instead of a dropdown
- **Live embed preview**: When entering a YouTube URL, show an inline thumbnail/preview. For PDF URLs, show a mini iframe preview
- **Tag autocomplete**: Suggest existing tags from the content library as user types
- **Bulk actions toolbar**: Select multiple items via checkboxes, then delete, move to another module, or change tags in bulk
- **Item duplication** button on each item row
- **Visual item cards** option: Toggle between list view and grid/card view for items within a module

## 6. Enhanced Quiz Builder (`QuizEditor.tsx`)

**Current state:** Basic collapsible question cards with text fields.

**Changes:**
- Add **question type selector**: Multiple choice (existing), True/False, Fill in the blank
- Add **image support** for questions (URL field for question images)
- Add **question bank import**: Paste multiple questions in a simple text format and auto-parse them
- Add **quiz settings panel**: Time limit, passing score, shuffle questions toggle, show explanations toggle
- Add **question preview mode**: Click "Preview" on any question to see it as a student would
- Add **drag-and-drop reorder** for questions
- Add a **question counter** and **difficulty tag** per question (Easy/Medium/Hard)

## 7. Content Preview Upgrade (`ContentPreview.tsx`)

**Current state:** Basic batch-scoped viewer with inline previews.

**Changes:**
- Add a **device frame toggle** (Desktop / Tablet / Mobile) that constrains the preview width to simulate responsive views
- Add **interactive navigation**: Clicking a course opens its modules, clicking a module shows items -- mimicking the real student flow with back/forward navigation
- Add a **split-screen mode**: Editor on left, live preview on right (using react-resizable-panels, already installed)
- Improve quiz preview with full scoring simulation

## 8. UI Polish & Micro-interactions

- **Smooth transitions**: Add `Fade` and `Grow` MUI transitions when switching tabs, opening dialogs, and expanding accordions
- **Empty states**: Add illustrated empty state messages with call-to-action buttons (e.g., "No courses yet -- Create your first course")
- **Confirmation dialogs**: Replace `window.confirm()` calls with styled MUI `Dialog` confirmations with warning icons
- **Toast notifications**: Replace the basic `Snackbar` with `sonner` toasts (already installed) for save/delete/error feedback
- **Loading skeletons**: Add MUI `Skeleton` components while content loads
- **Hover effects**: Add subtle elevation and scale transitions on cards
- **Color-coded type indicators**: Consistent color system for all 10 content types across the entire editor

---

## Technical Details

### New Types to Add (`types/content.ts`)
- `QuizSettings`: `{ timeLimit?: number; passingScore?: number; shuffleQuestions?: boolean; showExplanations?: boolean }`
- `QuestionType`: `'multiple_choice' | 'true_false' | 'fill_blank'`
- Update `QuizQuestion` with `type`, `imageUrl`, `difficulty` fields
- Add `CourseStatus`: `'draft' | 'published' | 'archived'` and add `status` field to `Course`

### New Components to Create
- `src/components/editor/EditorSidebar.tsx` -- Sidebar nav for editor tabs
- `src/components/editor/ContentSearch.tsx` -- Global search across all content
- `src/components/editor/ItemTypeSelector.tsx` -- Visual card-based type picker
- `src/components/editor/ItemCreationWizard.tsx` -- Multi-step item creation stepper
- `src/components/editor/BulkActions.tsx` -- Toolbar for multi-select operations
- `src/components/editor/ConfirmDialog.tsx` -- Reusable styled confirmation dialog
- `src/components/editor/EmptyState.tsx` -- Reusable empty state with illustration
- `src/components/editor/DevicePreviewFrame.tsx` -- Responsive preview wrapper
- `src/components/editor/QuizSettingsPanel.tsx` -- Quiz configuration panel
- `src/components/editor/ContentHealthCheck.tsx` -- Dashboard widget for content issues

### Files to Modify
- `src/pages/Editor.tsx` -- Complete redesign with sidebar nav, toolbar, breadcrumbs
- `src/components/editor/EditorDashboard.tsx` -- Charts, quick actions, health checks
- `src/components/editor/CourseEditor.tsx` -- Inline edit, duplication, status, filters
- `src/components/editor/ModuleEditor.tsx` -- Enhanced DnD, duplication, quick-add
- `src/components/editor/ItemEditor.tsx` -- Wizard flow, bulk actions, card view toggle
- `src/components/editor/QuizEditor.tsx` -- Question types, settings, reorder, preview
- `src/components/editor/ContentPreview.tsx` -- Device frames, split-screen, navigation
- `src/components/editor/BatchEditor.tsx` -- Minor polish (confirm dialogs, transitions)
- `src/types/content.ts` -- New type definitions
- `src/contexts/EditorContext.tsx` -- Add duplicate, undo/redo, bulk operations
- `src/lib/editorStorage.ts` -- Add duplicateCourse, duplicateModule, duplicateItem helpers

### Dependencies
- No new packages needed -- leverages existing Recharts, react-resizable-panels, sonner, and MUI

### Implementation Order
1. Type definitions and context updates (foundation)
2. Reusable components (ConfirmDialog, EmptyState, ContentSearch)
3. Editor page redesign (sidebar, toolbar, breadcrumbs)
4. Dashboard upgrade (charts, health checks, quick actions)
5. Course editor enhancements
6. Module editor enhancements
7. Item editor wizard and bulk actions
8. Quiz builder upgrade
9. Content preview upgrade
10. Final polish (transitions, hover effects, toasts)

