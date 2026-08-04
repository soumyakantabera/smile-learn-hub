# Embed hardening, graceful fallbacks, and Vercel deployment

## 1. Harden every embed iframe

Today only one of the five iframes in the app sets a referrer policy, and none set `sandbox`. Centralize this so every embed shares the same safe defaults.

- Add shared iframe attributes to `src/lib/embed.ts`: a `sandbox` allowlist (`allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation`), `referrerPolicy="strict-origin-when-cross-origin"`, `loading="lazy"`, and provider-appropriate `allow` (fullscreen/autoplay only for video providers).
- Extend `EmbedInfo` with an `embeddable` flag plus these attributes, so consumers stop hand-rolling them.
- Apply in all four iframe sites: `src/pages/Viewer.tsx` (video, document, and secondary frames), `src/components/editor/ItemEditor.tsx` (live preview), `src/components/editor/ContentPreview.tsx`.
- Opening behavior: every embed gets an explicit "Open in new tab" action using `openUrl`, with `target="_blank" rel="noopener noreferrer"`. Providers known not to allow framing (unknown/direct non-media links, and links flagged as non-embeddable) render the open-in-new-tab card instead of an iframe.

## 2. Graceful fallback UI

- New component `src/components/viewer/EmbedFallback.tsx`: LWS-styled card with the content-type icon, a short reason ("This resource can't be previewed here" / "Preview failed to load"), the original URL shown as a truncated chip, a primary "Open resource" button (new tab), and a "Retry preview" button.
- Two triggers:
  - **Resolve failure** — `resolveEmbed` returns no URL, so the fallback renders immediately.
  - **Load failure** — wrap each iframe in a small `EmbedFrame` component that tracks `onLoad`, plus a timeout (~8s) with no load event; on failure it swaps to `EmbedFallback`. Retry remounts the iframe with a fresh key.
- Show a lightweight skeleton/spinner while the frame loads, so blank frames never look broken.
- Use `EmbedFrame` in Viewer, ItemEditor preview, and ContentPreview so learners and admins see the same behavior. In the editor, the note from `resolveEmbed` (e.g. Drive sharing hint) is surfaced in the fallback.

## 3. Vercel deployment

- Add `vercel.json` with SPA rewrite (`/(.*)` → `/index.html`) and long-cache headers for `/assets/*`.
- Fix the base path: `vite.config.ts` currently hardcodes `base: '/learn-with-smile-moodle/'` in production, which breaks Vercel. Change to read `process.env.VITE_BASE_PATH` (defaulting to `/`), so Vercel works out of the box while GitHub Pages can still set the subpath.
- Update `.github/workflows/deploy.yml` to pass `VITE_BASE_PATH=/learn-with-smile-moodle/` for the Pages build so that deploy keeps working.
- Document in `README.md`: import repo into Vercel, framework Vite, build `npm run build`, output `dist`, and the env vars to set (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`).

Note: the backend (database, auth, functions) stays on Lovable Cloud; Vercel hosts only the frontend, and the Lovable "Publish" flow keeps working unchanged.

## Verification

- Typecheck, then drive the running preview with Playwright: confirm a YouTube embed and a Google-viewer PDF still load with the new sandbox attributes, and that a deliberately broken URL renders the fallback card with a working external link.
