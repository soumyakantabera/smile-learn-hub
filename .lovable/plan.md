## Goal
Rework the `/editor` (LMS Editor) so it feels compact on mobile, adopts the Learn With Smile palette, exposes richer per-item customization, and supports two new activity formats: **Conversation Practice** (browser TTS) and **Step Quiz** (Duolingo-style).

## 1. Editor UI redesign — compact + cross-platform

### Palette (from learnwithsmile.app, applied as tokens in `src/index.css` + `tailwind.config.ts` + `muiTheme.ts`)
- `--brand-forest`: deep green `#0F3D2E` (primary surfaces, admin chrome)
- `--brand-mint`: soft mint `#C8E6D3` (hover / pill backgrounds)
- `--brand-amber`: warm yellow `#F5B921` (primary CTA, highlights)
- `--brand-coral`: warm coral `#F26B5E` (accent, live/alert)
- `--brand-cream`: off-white `#FFF8EC` (cards)
- Existing Indigo stays for learner-facing screens; the LWS palette scopes to `/editor` and `/admin` to keep the brand cohesive without a full site retheme.

### Layout changes in `src/pages/Editor.tsx` + `src/components/editor/*`
- Replace the current wide top toolbar with a **two-row compact header**:
  - Row 1 (always): title + status pill (Saved / Unsaved / Size).
  - Row 2 (desktop): tabs + action buttons; on mobile the actions collapse into a single "Editor menu" icon-button (`MoreVert`) opening a bottom sheet with Save / Publish / Import / Export / Reset / Undo / Redo / Snapshots / Shortcuts.
- Tabs become **icon-only pills on mobile** (label hidden < sm), 44px tall instead of 56.
- Dashboard stat grid: 3-per-row on mobile (currently 2), icon+number stacked tight, remove the avatar circle in favor of a small colored dot.
- Card padding reduced (`px: {xs: 1.5, sm: 3}`), `Grid spacing 1.5` on mobile.
- Sticky mobile floating "Save" pill above the bottom nav only when `isDirty`, so the primary action is always one tap away without eating vertical space.
- Verified against three viewports (360×640, 768×1024, 1440×900) via Playwright before shipping.

## 2. Comprehensive content customization

Extend `ContentItem` (in `src/types/content.ts`) with optional per-item presentation fields the editor exposes:
- `accentColor?: string` — chip / header color override.
- `icon?: string` — pick from a curated `lucide-react` icon set (`Book`, `Headphones`, `MessageCircle`, …).
- `visibility?: 'published' | 'draft' | 'hidden'`.
- `estimatedMinutes?: number`.
- `objectives?: string[]` — bulleted "you will learn".
- `resources?: { label: string; url: string }[]` — supplementary links.
- `prerequisiteItemIds?: string[]` — gate item until prereqs completed.

`ItemEditor.tsx` gets a **tabbed drawer** (Details / Media / Customize / Advanced) replacing the current single tall form. Live preview card on the right on desktop, collapsible on mobile.

## 3. New item type: Conversation Practice

- `ItemType` gains `'conversation'`.
- New `ConversationLine` shape:
  ```ts
  interface ConversationLine {
    id: string;
    speaker: string;         // "Anna", "Ravi"
    voice?: string;          // preferred SpeechSynthesis voice URI/lang
    text: string;
    translation?: string;
    rate?: number;           // 0.5–1.5
    pitch?: number;          // 0.5–1.5
  }
  ContentItem.conversation?: {
    scenario?: string;
    lines: ConversationLine[];
    autoPlay?: boolean;
  }
  ```
- Editor: new `ConversationEditor.tsx` — add/reorder lines, per-line speaker + voice picker populated from `window.speechSynthesis.getVoices()`, inline "Preview" button that speaks the line.
- Viewer: new `ConversationViewer.tsx` — chat-bubble UI with speaker avatars in alternating colors (mint / coral). Each bubble has a **Listen icon** (`Volume2` from lucide) that calls `speechSynthesis.speak(new SpeechSynthesisUtterance(...))`. A top "Play all" button walks the dialog sequentially, respecting per-line `rate/pitch`. Translations reveal on tap. Graceful fallback text if the browser lacks TTS.
- Register `conversation` in `typeColors`, `ITEM_TYPES`, `EditorDashboard` stats, filters, and quiz-adjacent code paths.

## 4. Step-Quiz (Duolingo-style)

Add a second quiz mode alongside the current single-page MCQ.

- Extend `QuizQuestion` with `type: 'mcq' | 'tap-order' | 'match' | 'listen-choose' | 'fill-blank'` (default `mcq`) and optional fields per variant (`pairs`, `tokens`, `blanks`, `audioText`).
- Extend `ContentItem` with `quizMode?: 'classic' | 'step'`.
- Editor: `QuizEditor.tsx` gains a mode toggle. In `step` mode each question is authored one-at-a-time with a variant picker; `listen-choose` uses browser TTS (reuse the voice picker from conversation).
- Viewer: new `StepQuizViewer.tsx` — one question full-screen, big progress bar, instant right/wrong feedback bar with continue button, hearts/streak optional (config flag), correct-answer chime via `SpeechSynthesis` or a short beep. Reuses `saveQuizAttempt` for score persistence.

## 5. Technical notes

- All TTS runs client-side via `window.speechSynthesis` — no backend, no API keys, no cost. Voice list is loaded lazily because Chrome fires `voiceschanged` asynchronously.
- Type additions are additive and backward compatible; existing JSON keeps working (`type: 'quiz'` with no `quizMode` renders classic).
- Palette tokens are added; existing indigo tokens remain so learner screens are untouched unless we opt in.
- No schema/database changes required.

## Out of scope
- Server-side TTS or voice cloning.
- Migrating content JSON into the database.
- Retheming the learner-facing dashboard/viewer (kept on the current indigo palette).
