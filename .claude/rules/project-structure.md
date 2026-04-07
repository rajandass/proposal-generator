---
description: Project directory structure and file responsibilities
---

# Project Structure

```
proposal-generator/
├── frontend/                  # Next.js 14 App Router
│   ├── app/
│   │   ├── (auth)/            # login, onboarding, settings (auth required)
│   │   ├── dashboard/         # proposal list page
│   │   ├── proposals/
│   │   │   ├── new/           # AI brief input form
│   │   │   └── [id]/edit/     # proposal editor (review + publish)
│   │   └── p/
│   │       └── [token]/       # public proposal page (no auth)
│   │           └── success/   # post-payment success animation
│   ├── components/            # shared UI components
│   ├── lib/                   # supabase client, API helpers
│   └── Dockerfile
├── backend/                   # Python FastAPI
│   ├── api/
│   │   ├── proposals.py       # CRUD endpoints
│   │   ├── generate.py        # AI generation endpoint
│   │   ├── sign.py            # e-signature capture
│   │   └── razorpay.py        # payment order + webhook
│   ├── ai/
│   │   └── provider.py        # OpenAI/Anthropic abstraction layer
│   ├── models/                # Pydantic request/response models
│   ├── db/
│   │   ├── client.py          # Supabase client singleton
│   │   └── migrations/        # SQL migration files
│   ├── tests/                 # pytest test files
│   ├── main.py                # FastAPI app entry point
│   └── Dockerfile
├── docs/
│   └── superpowers/
│       ├── specs/             # design documents
│       └── plans/             # implementation plans
├── .claude/
│   ├── CLAUDE.md              # main AI context index
│   ├── agents/                # project-specific agent instructions
│   ├── skills/                # project-specific skills
│   └── rules/                 # focused convention files (this folder)
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD
├── docker-compose.yml
└── .env.example
```
