
## Audit findings

1. **Publishing is NOT one-click live.** Editor edits save to `localStorage`. "Publish" only shows a diff and downloads `index.json` — you must manually replace `public/content/index.json` in the repo, commit, and redeploy on GitHub Pages. Students never see the changes until a rebuild.
2. **Users page create/reset flows work** but have rough edges:
   - Password `soumya01`-style short strings are allowed (min 6). If HIBP is on, weak passwords silently sign in but flag "pwned". No strength/eye toggle.
   - No "copy full welcome message" (email + password + login URL) — admin has to assemble it manually.
   - Reset dialog auto-fills a random password but never shows old copy state, no visible confirmation the user was notified.
   - `createUser` errors surface only inside the dialog; success closes it before the admin can copy the password.
3. **Color scheme** is warm boutique but a bit heavy on amber/cream. Tweak to a slightly cooler, more elegant palette while keeping the LWS forest/mint identity.

## Plan

### 1. One-click live publish (backend-backed content)

Move published content from `public/content/index.json` into the database so the "Publish" button pushes changes live instantly to every learner.

- New table `public.site_content` (single row, `id='current'`, `data jsonb`, `updated_at`, `updated_by`).
  - RLS: anyone (anon + authenticated) can SELECT the current row; only admins can INSERT/UPDATE.
  - Seeded once with the current `public/content/index.json` on migration.
- `loadContent()` fetches the row from the DB first, falls back to bundled JSON if the fetch fails (offline / first boot).
- Editor "Publish" wizard becomes a real publish button:
  - Shows the same diff summary.
  - Primary action **"Publish live now"** upserts the draft into `site_content` (admin-only RLS).
  - On success: toast "Live for all learners", `ContentContext` refetches, learners get new content on next navigation (or immediately via a lightweight version poll — optional, out of scope for v1).
  - Keeps "Download JSON" as a secondary backup action.
- Editor still uses localStorage for the working draft; "Save" = local draft, "Publish" = live to backend.

### 2. Users page fixes

- **Create user dialog**
  - Show/hide password toggle; strength meter (length + variety); block < 8 chars.
  - After successful creation, keep dialog open on a "User created" success step showing email + password + a **"Copy welcome message"** button that copies a ready-to-send template (name, login URL, email, temp password, note to change it).
  - Better error surfacing (e.g. duplicate email, weak password from HIBP).
- **Reset password dialog**
  - Show/hide toggle, strength meter, same "Copy welcome message" step after success.
- **Row actions**
  - Replace `window.confirm` for delete with the existing `ConfirmDialog` component so it matches the theme.
  - Small polish: show role chip color from tokens, show "Never logged in" if no `last_sign_in_at` (add to edge function response).
- Ensure `admin-create-user` returns a clear message for password-too-weak/duplicate email; front-end maps them to friendly text.

### 3. Palette refresh (subtle)

Tweak brand tokens in `src/index.css` and `src/theme/muiTheme.ts` — keep the warm boutique DNA but pull cream slightly cooler and deepen the primary for more elegance:

```
--brand-forest:      158 55% 18%   (from 61% 15%)   deeper, richer green
--brand-mint:        152 42% 52%
--brand-amber:       36  88% 58%   (slightly softer)
--brand-coral:       12  78% 62%
--surface-1:         42 30% 98%    (cooler cream)
--surface-2:         42 25% 95%
--hairline:          158 20% 88%   (tinted, not neutral)
--gradient-primary:  linear-gradient(135deg, hsl(158 55% 18%), hsl(152 42% 42%))
```

Regenerate button gradient, sidebar tile, and hero wash from the new tokens (no per-component color hardcodes changed). Verify contrast on Login, Dashboard, Viewer, Users, Editor.

### 4. Verification

- Type-check with `tsgo`.
- Playwright walkthrough:
  1. Sign in as admin → Editor → edit an item title → Publish → open a second incognito context → confirm learner sees the new title without a rebuild.
  2. Users → New user → verify strength meter, welcome-message copy, created user can sign in.
  3. Reset password on the new user → sign in with new password.
- Screenshots of Login, Dashboard, Users, Editor (new palette) on desktop + mobile.

## Technical notes

- Migration adds `site_content`, GRANTs (`SELECT` to `anon`+`authenticated`, ALL to `service_role`, `INSERT/UPDATE` to `authenticated` gated by `has_role(auth.uid(), 'admin')`), RLS policies, and seeds the current JSON.
- Publish path uses the existing supabase client + `has_role`-based RLS — no new edge function required.
- Content cache in `src/lib/content.ts` gets a `refreshContent()` export so `ContentContext` can force-refetch after publish (and after login).
- No changes to learner-facing routing or auth. No new secrets.
