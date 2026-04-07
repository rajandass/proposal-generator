# Project Structure

```
proposal-generator/
├── frontend/                  # Next.js 14 App Router
│   ├── app/
│   │   ├── (auth)/            # login, onboarding, settings
│   │   ├── dashboard/         # proposal list
│   │   ├── proposals/
│   │   │   ├── new/           # AI brief form
│   │   │   └── [id]/edit/     # editor (review + publish)
│   │   └── p/[token]/         # public proposal page (no auth)
│   │       └── success/       # post-payment animation
│   ├── components/
│   ├── lib/                   # supabase clients, api helper
│   └── Dockerfile
├── backend/                   # Python FastAPI
│   ├── api/
│   │   ├── proposals.py       # CRUD
│   │   ├── generate.py        # AI generation
│   │   ├── sign.py            # e-signature
│   │   └── razorpay.py        # payment + webhook
│   ├── ai/provider.py         # OpenAI/Anthropic abstraction
│   ├── models/                # Pydantic models
│   ├── db/client.py           # Supabase singleton
│   ├── db/migrations/         # SQL migration files
│   ├── tests/
│   └── Dockerfile
├── docs/superpowers/
│   ├── specs/                 # design documents
│   └── plans/                 # implementation plans
├── .claude/
│   ├── CLAUDE.md
│   └── rules/
├── .github/workflows/ci.yml
├── docker-compose.yml
└── .env.example
```
