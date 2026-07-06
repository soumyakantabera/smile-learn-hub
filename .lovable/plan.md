
# Elegant redesign — Warm Boutique (LWS)

A whole-app visual refresh in the "warm boutique" register: cream canvas, forest ink, amber + coral accents, tactile rounded cards, soft layered shadows, quiet motion. Typography stays Sora (display) + Manrope (body). Density = 3 (balanced — comfortable but not sparse).

Only presentation code changes. No business logic, routes, data model, or auth changes.

## Design commitments

**Palette (locked to LWS)**
- Canvas: cream `#FFF8EC`
- Ink: forest `#0F3D2E`
- Highlight: amber `#F5B921`
- Alert / warm accent: coral `#F26B5E`
- Soft surface: mint `#C8E6D3`
- Dark mode: deep forest surfaces, mint primary, amber/coral kept as accents

**Type & rhythm**
- Sora 700–800 for display / section headers, tighter tracking (-0.02em)
- Manrope 400/500/600 body, 15–16px base, 1.55 line-height
- One serif-free hierarchy; use size + weight, not color, for hierarchy

**Surfaces**
- Card radius 16–20, layered shadows: `0 1px 0 rgba(15,61,46,.04), 0 12px 32px -18px rgba(15,61,46,.22)`
- Subtle 1px hairline borders in `forest / 8%`
- Cream page bg with faint radial amber wash top-right, mint wash bottom-left (hero pages only)

**Motion (quiet)**
- 180–240ms cubic-bezier(.2,.7,.2,1) on hover/scale
- Cards lift 2px + shadow deepen on hover
- Route transitions: 200ms fade+2px rise
- Respect `prefers-reduced-motion`

## Scope — screens touched

**Shell**
- `AppLayout` sidebar: replace flat forest gradient header with cream header + small forest logo mark + amber dot; nav items get pill hover, active state = forest pill with cream text and amber left indicator (3px)
- AppBar: cream translucent, hairline bottom border, page title in Sora 600
- `MobileBottomNav`: cream with forest icons, active = amber underline + forest icon; reduce height to 60px

**Auth**
- `Login`: keep split layout but soften — left panel goes cream-on-forest with an amber sun-arc motif, right form on paper with generous padding, primary CTA becomes forest→forest-dark gradient with amber focus ring
- `ResetPassword`: matching card treatment

**Learner surfaces**
- `Dashboard`: hero greeting card (cream + amber wash, forest headline, coral streak chip), then a 3-up stat strip (icon dot + big Sora number), then Resume card and Recent items in a 2-col responsive grid
- `Courses`: switch to a boutique card grid — cover image (or gradient placeholder), Sora title, Manrope meta row, progress rail in mint→amber
- `CourseDetail` / `ModuleDetail`: editorial header (breadcrumb, Sora H1, meta chips), module list as tactile stacked cards with left rail color per item type (video=amber, pdf=coral, conversation=mint, quiz=forest)
- `Viewer`: cream reading surface, sticky slim `ItemNavBar` (forest text, amber progress bar), `ModuleOutlineDrawer` gets rounded item chips
- `RecentItemCard`, `ResumeCard`, `PageHeader`: unified card language

**Admin & Editor**
- `AdminDashboard`, `Users`, `Enrollments`, `ProgressOverview`: same boutique card + table treatment (cream table head, forest text, amber active row indicator)
- `Editor` (`EditorDashboard`, `ItemEditor`, `QuizEditor`, `ConversationEditor`, `ModuleEditor`, `CourseEditor`, `BatchEditor`, `PublishWizard`): compact but elegant — sticky save pill becomes forest with amber label chip; tab bar gets underline indicator in amber; form sections wrapped in soft cards with Sora section titles

## Token & theme changes

- `src/index.css`: refine gradients, shadows, add `--surface-1/2/3`, `--hairline`, hero wash utility classes; keep existing brand vars
- `src/theme/muiTheme.ts`: tune `MuiCard`, `MuiButton` (add `contained-primary` warmer shadow), `MuiTab` (amber underline), `MuiChip` (soft mint/amber variants), `MuiTableCell` head, `MuiOutlinedInput` focus ring
- No new fonts; already loaded

## Technical notes

- All colors via semantic tokens / `hsl(var(--...))` — no hardcoded hex in components
- Reuse existing shadcn/MUI primitives; only style overrides + small composition tweaks
- Framer Motion already available for the quiet route + card hover transitions
- Keep existing component APIs; edits are internal styling + minor JSX structure

## Out of scope

- No changes to data fetching, auth, RLS, edge functions, content JSON schema
- No new features, no logo redraw, no image generation unless a hero placeholder is strictly needed

## Verification

- Playwright screenshots at 390×800 (mobile) and 1280×900 (desktop) for: Login, Dashboard, Courses, CourseDetail, Viewer, Editor, AdminDashboard
- `bunx tsgo --noEmit` typecheck
