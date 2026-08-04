# Learn with Smile Moodle

A static learning management system built with React, TypeScript, and Material UI for GitHub Pages deployment.

## Features

- 📚 Course/Module/Resource hierarchy
- 🔐 Batch passcode authentication (SHA-256 hashed, client-side)
- 📄 PDF, video, document viewers
- 📝 Homework submission via WhatsApp/Email
- 🔍 Search & filter by type/tags
- 🌙 Light/Dark theme toggle
- 📱 Responsive Material Design

## Quick Start

```bash
npm install
npm run dev        # Development at http://localhost:8080
npm run build      # Production build
```

**Demo passcodes**: `123`, `456`, or `demo`

## Vercel Deployment

1. Import the repository at vercel.com/new (framework preset: **Vite**).
2. Build command `npm run build`, output directory `dist` — already declared in `vercel.json`.
3. Add these Environment Variables (Production + Preview), copied from `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
4. Deploy. `vercel.json` adds the SPA rewrite so deep links such as `/view/item-1` work on refresh.

Leave `VITE_BASE_PATH` unset on Vercel (the app is served from the domain root).
The backend (database, auth, edge functions) stays hosted on Lovable Cloud, so no
extra server setup is required.

## GitHub Pages Deployment

1. Set `VITE_BASE_PATH` in `.github/workflows/deploy.yml` to `/your-repo-name/`
2. Push to `main` branch
3. Enable GitHub Pages with "GitHub Actions" source

The included `.github/workflows/deploy.yml` handles automatic deployment.


## Adding Content

Edit `public/content/index.json` with batches → courses → modules → items structure.

## Adding Passcodes

1. Hash your passcode (SHA-256, lowercase): Use any SHA-256 tool
2. Add to `public/passcodes.json` with batchKey and label
3. Add matching batch to content JSON

## ⚠️ Security Note

Client-side passcode validation is NOT secure for sensitive data. Suitable for basic educational content access control only. All hashes are visible in browser. For proper security, use a backend with server-side authentication.

## Tech Stack

React 18 • TypeScript • Vite • Material UI • Tailwind CSS • React Router
