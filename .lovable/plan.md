
# Learn with Smile — Auth, Admin CMS, Progress Sync & Visual Refresh

## 1. Backend (Lovable Cloud)

Enable Lovable Cloud and provision:

- **auth.users** — managed; email/password only, email confirmation OFF (admin creates accounts and shares credentials personally).
- **profiles** — `id` (FK auth.users), `full_name`, `email`, `phone`, `avatar_url`, `created_at`. Auto-created on signup via trigger.
- **user_roles** — `(user_id, role)` with enum `app_role` = `admin | student`. Read via `has_role()` SECURITY DEFINER. Never on profiles.
- **enrollments** — `(user_id, course_id, enrolled_at, enrolled_by, status)`. Admin-only writes; user reads own.
- **progress** — `(user_id, item_id, course_id, module_id, visited_at, completed, time_spent_seconds)`. Unique on `(user_id, item_id)`.
- **quiz_attempts** — `(user_id, item_id, score, max_score, answers jsonb, attempted_at)`.
- **resume_state** — `(user_id, course_id, last_item_id, last_module_id, updated_at)`. Unique on `(user_id, course_id)`.
- **support_tickets** (optional log) — skip for now; CTA is direct WhatsApp deep link.

All tables: GRANTs to authenticated + service_role, RLS enabled, policies scoped to `auth.uid()` (admin overrides via `has_role(auth.uid(),'admin')`).

`course_id` / `module_id` / `item_id` remain string IDs from the existing JSON content (no content migration this pass).

## 2. Auth changes

- Remove `public/passcodes.json`, `src/lib/auth.ts` passcode logic, batch-key concept from `SessionData`, `AuthContext`.
- Rewrite `AuthContext` on Supabase: `onAuthStateChange` + `getSession`, `signInWithPassword`, `signOut`. No public signup UI.
- New `/login` page — email + password, "forgot password" → `resetPasswordForEmail`, `/reset-password` page.
- `ProtectedRoute` checks session; new `AdminRoute` checks `has_role('admin')`.
- Seed one admin via SQL migration (email provided by user during build, or default `admin@learnwithsmile.local` with a generated temp password shown once).

## 3. Progress sync

- `src/lib/progress.ts` — `markVisited(itemId)`, `markCompleted(itemId)`, `saveQuizAttempt(...)`, `setResume(courseId,itemId)`, plus realtime-friendly fetchers `useProgress(courseId)`, `useResume()`.
- `Viewer.tsx`: on mount → markVisited + setResume + start time-spent timer; on unmount → flush time.
- `ResumeCard` / `CourseProgressRail` / `ItemDotsStrip` read from DB instead of localStorage.
- Dashboard gains a **My Progress** panel: per enrolled course → % complete, last opened item ("Resume"), total time, quiz best scores. Cross-device because it's server-side.

## 4. Admin CMS (`/admin/*`, admin-only)

Replace the old `/editor` admin surface with a proper management console:

- `/admin` — overview: user count, active today, enrollments, recent signups.
- `/admin/users` — list, search, create user (email + temp password, copy-to-clipboard toast), edit profile, reset password, disable, delete.
- `/admin/enrollments` — pick user → toggle courses on/off; bulk enroll by course.
- `/admin/content` — keep existing JSON editor (`Editor.tsx`) under this route, unchanged behavior.
- `/admin/progress` — read-only table: per user/course progress + last seen.

User creation uses an edge function `admin-create-user` (service-role key) that: validates admin caller via JWT + `has_role`, calls `auth.admin.createUser({ email, password, email_confirm: true })`, inserts profile + role.

## 5. Support CTA

Floating button in `AppLayout` (and a card on Dashboard + Help page) → `https://wa.me/919674479949?text=...` with prefilled message including user email + current page. Mobile: lives above the bottom nav, respects safe-area.

## 6. Visual refresh — Indigo + Coral, mobile-first

Design tokens in `src/index.css` + `tailwind.config.ts` + `muiTheme.ts` (all three in sync):

```
--primary:        239 84% 60%   /* Indigo #4F46E5 */
--primary-glow:   250 92% 72%
--accent:         38 92% 50%    /* Amber #F59E0B */
--destructive:    0 84% 60%     /* Coral/Red #EF4444 */
--background:     210 40% 98%   /* #F8FAFC */
--foreground:     222 47% 11%   /* #0F172A */
--card / --muted / --border tuned to match
--gradient-primary: linear-gradient(135deg, hsl(239 84% 60%), hsl(38 92% 50%))
--gradient-hero:    linear-gradient(140deg, hsl(239 84% 60% / .12), hsl(38 92% 50% / .08))
--shadow-elegant:   0 18px 40px -18px hsl(239 84% 60% / .35)
```

Dark mode mirrored (deeper navy bg, indigo stays vibrant, coral as accent pop).

Typography (via `@fontsource`): **Outfit** for headings, **Inter** for body. No purple gradients, no generic AI look.

Component pass:
- New gradient hero header on Dashboard with greeting + streak chip + WhatsApp CTA.
- `PageHeader` — softer rounded breadcrumb pills, gradient icon tile uses `--gradient-primary`, mobile compact mode shrinks to 44px tile + single-line truncating title.
- Course / Module / Item cards — `rounded-2xl`, `shadow-elegant` on hover, coral accent ring on "in progress", amber chip on "new".
- `MobileBottomNav` — 64px tall, 5 slots max, active item gets gradient pill + label, blurred bg (`backdrop-blur`), safe-area aware.
- `ItemNavBar` — pill-shaped floating bar on mobile, sits above bottom nav with 12px gap, prev/next as 44×44 tap targets, center shows progress ring.
- `ItemDotsStrip` — horizontally scrollable on mobile with snap, current dot scales 1.4× with coral glow.
- `Login` — split-card on desktop (gradient panel left, form right), single elegant card on mobile, large 48px touch inputs.
- Admin pages — same tokens, denser tables on desktop, card list on mobile (no horizontal scroll).

Mobile audit carry-over (already done previously) stays in place; this pass tightens spacing scale to a 4px base, ensures 16px page gutters on xs, 24px on sm+.

## 7. Cleanup

Delete: `public/passcodes.json`, batch-key UI, demo passcode hint on Login, `appConfig.session.storageKey` (Supabase manages session).

Keep: existing content JSON, content navigation lib, viewer drawers/strips (rewired to DB progress).

## Out of scope

- Migrating content JSON into the DB (still file-driven).
- Email customization (uses default Lovable auth emails for password reset only).
- Multi-tenant batches (replaced by per-user enrollments).

## Files (high-level)

**New:** `src/contexts/AuthContext.tsx` (rewritten), `src/lib/progress.ts`, `src/hooks/useProgress.ts`, `src/hooks/useEnrollments.ts`, `src/components/AdminRoute.tsx`, `src/components/SupportFab.tsx`, `src/pages/ResetPassword.tsx`, `src/pages/admin/AdminDashboard.tsx`, `src/pages/admin/Users.tsx`, `src/pages/admin/Enrollments.tsx`, `src/pages/admin/ProgressOverview.tsx`, `supabase/functions/admin-create-user/index.ts`.

**Edited:** `src/App.tsx` (routes), `src/pages/Login.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Viewer.tsx`, `src/components/AppLayout.tsx`, `src/components/MobileBottomNav.tsx`, `src/components/PageHeader.tsx`, `src/components/viewer/*`, `src/index.css`, `tailwind.config.ts`, `src/theme/muiTheme.ts`, `src/config/app.config.ts` (add WhatsApp number).

**Deleted:** `public/passcodes.json`, passcode hashing helpers in `src/lib/auth.ts` (file kept but trimmed or removed).
