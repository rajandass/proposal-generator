# CLAUDE.md — Proposal Generator Platform

This file gives Claude Code full context about this project so every session starts informed.

## What This Project Is

A multi-tenant SaaS platform where software developers/agencies:
1. Log in and create proposals via an AI brief form
2. Get a shareable public URL to send to their client
3. Client views the proposal, signs it (type or draw), and pays via Razorpay
4. Dashboard tracks all proposal statuses

Full design spec: `docs/superpowers/specs/2026-04-07-proposal-generator-design.md`

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router + Tailwind CSS |
| Backend | Python 3.11 FastAPI |
| Database + Auth | Supabase (PostgreSQL + Supabase Auth) |
| AI | OpenAI GPT-4o OR Anthropic claude-sonnet-4-6 (switch via AI_PROVIDER env var) |
| Payments | Razorpay (India, one-time payment, single account) |
| Containers | Docker + docker-compose |
| CI/CD | GitHub Actions → GHCR (ghcr.io) |

## Project Structure

```
proposal-generator/
├── frontend/                  # Next.js 14 App Router
│   ├── app/
│   │   ├── (auth)/            # login, onboarding, settings
│   │   ├── dashboard/         # proposal list
│   │   ├── proposals/
│   │   │   ├── new/           # AI brief form
│   │   │   └── [id]/edit/     # proposal editor
│   │   └── p/
│   │       └── [token]/       # public proposal page (no auth)
│   ├── components/
│   ├── lib/                   # supabase client, api helpers
│   └── Dockerfile
├── backend/                   # FastAPI
│   ├── api/
│   │   ├── proposals.py       # CRUD
│   │   ├── generate.py        # AI generation endpoint
│   │   ├── sign.py            # signature capture
│   │   └── razorpay.py        # payment + webhook
│   ├── ai/
│   │   └── provider.py        # OpenAI/Anthropic abstraction
│   ├── models/                # Pydantic models
│   ├── db/                    # Supabase client
│   ├── main.py
│   └── Dockerfile
├── docs/
│   └── superpowers/
│       ├── specs/             # design documents
│       └── plans/             # implementation plans
├── .github/workflows/ci.yml
├── docker-compose.yml
└── .env.example
```

## Key Conventions

### Backend (FastAPI)
- All routes prefixed with `/api/`
- Use async functions throughout
- Pydantic models in `backend/models/`
- Supabase client initialized in `backend/db/client.py`
- Auth: verify Supabase JWT on all protected routes via `Authorization: Bearer <token>` header
- Public routes (no auth): GET `/api/proposals/public/{token}`, POST `/api/sign`, POST `/api/razorpay/*`

### Frontend (Next.js)
- App Router only — no Pages Router
- Server Components by default; add `"use client"` only when needed
- Tailwind for all styling — no CSS modules or styled-components
- Supabase client: `frontend/lib/supabase.ts` (browser) and `frontend/lib/supabase-server.ts` (server)
- Auth middleware in `frontend/middleware.ts` — protects all routes except `/login`, `/p/[token]/*`
- API calls to backend via `NEXT_PUBLIC_API_URL` env var

### AI Provider Switching
```bash
# In .env:
AI_PROVIDER=openai      # uses gpt-4o
AI_PROVIDER=anthropic   # uses claude-sonnet-4-6
```

### Proposal Template Sections (6 total)
The `content` JSONB field in the `proposals` table maps to:
1. `executive_summary` — problem + proposed solution
2. `scope_of_work` — deliverables + resources
3. `timeline` — phases with durations
4. `expenditure` — line items with cost + tax_rate
5. `about_us` — company bio (pre-filled from user_profiles)
6. `contact` — company address/phone/email (pre-filled from user_profiles)

### Proposal Status Flow
`draft` → `published` → `signed` → `paid`

### Testing
- Backend: pytest + httpx (async test client)
- Frontend: jest + React Testing Library
- TDD: write failing test first, implement, make it pass

## Environment Variables (see .env.example)

```
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
AI_PROVIDER=openai
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Running Locally

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API docs: http://localhost:8000/docs
```

## CI/CD

GitHub Actions on push to `main`:
1. Run pytest (backend) + jest (frontend)
2. Build Docker images
3. Push to GHCR: `ghcr.io/rajandass/proposal-frontend` and `ghcr.io/rajandass/proposal-backend`
