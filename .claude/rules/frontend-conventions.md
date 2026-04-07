---
paths:
  - "frontend/**/*"
---

# Frontend Conventions (Next.js 14)

## Architecture
- App Router only — no Pages Router
- Server Components by default; `"use client"` only for browser APIs, event handlers, hooks, Razorpay
- Tailwind CSS only — no CSS modules, no styled-components

## Auth
- Browser Supabase client: `frontend/lib/supabase.ts` — Client Components
- Server Supabase client: `frontend/lib/supabase-server.ts` — Server Components + Route Handlers
- Middleware: `frontend/middleware.ts` — protects all routes except `/login` and `/p/`

## API Calls to Backend
- Helper: `frontend/lib/api.ts` → `apiFetch(path, options)` — auto-attaches Supabase JWT
- Public proposal page calls backend without auth header

## Data Fetching
- Server Components: query Supabase directly with server client
- Client Components: use `apiFetch()` for backend API calls

## Onboarding Gate
- After login, check `user_profiles` — if missing, redirect to `/onboarding`
- Profile data pre-fills `about_us` and `contact` in every new proposal

## Routes
- Auth-required: `/dashboard`, `/proposals/*`, `/settings`, `/onboarding`
- Public (no auth): `/login`, `/p/[token]`, `/p/[token]/success`
