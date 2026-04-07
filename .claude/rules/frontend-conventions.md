---
description: Next.js frontend coding conventions and patterns
---

# Frontend Conventions (Next.js 14)

## Routing
- App Router only — no Pages Router
- Route groups: `(auth)/` wraps login, onboarding, settings
- Public routes: `/p/[token]/` and `/p/[token]/success/` — no auth required
- Protected routes: everything else — redirected to `/login` if not authenticated

## Components
- Server Components by default
- Add `"use client"` only when the component needs: browser APIs, event handlers, hooks, or Razorpay
- Shared components in `frontend/components/`

## Styling
- Tailwind CSS only — no CSS modules, no styled-components, no inline styles
- Follow utility-first approach

## Auth
- Supabase browser client: `frontend/lib/supabase.ts` — use in Client Components
- Supabase server client: `frontend/lib/supabase-server.ts` — use in Server Components and Route Handlers
- Middleware: `frontend/middleware.ts` — protects all routes except `/login` and `/p/`

## API Calls to Backend
- All calls via `NEXT_PUBLIC_API_URL` env var (e.g., `http://localhost:8000`)
- Helper: `frontend/lib/api.ts` → `apiFetch(path, options)` — auto-attaches Supabase JWT
- Public proposal page calls backend directly without auth header

## Data Fetching
- Server Components: fetch directly from Supabase using server client
- Client Components: use `apiFetch()` helper for backend calls

## Onboarding Gate
- After login, check `user_profiles` table
- If profile missing → redirect to `/onboarding`
- Profile data pre-fills `about_us` and `contact` sections in every new proposal

## Testing
- Jest + React Testing Library
- Test files alongside components or in `__tests__/` folder
