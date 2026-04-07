---
description: Technology stack for the proposal-generator platform
---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router + Tailwind CSS |
| Backend | Python 3.11 FastAPI |
| Database + Auth | Supabase (PostgreSQL + Supabase Auth) |
| AI | OpenAI GPT-4o OR Anthropic claude-sonnet-4-6 (switch via `AI_PROVIDER` env var) |
| Payments | Razorpay (India, one-time payment, single account) |
| Containers | Docker + docker-compose |
| CI/CD | GitHub Actions → GHCR (ghcr.io/rajandass) |
| Version Control | Git — repo at https://github.com/rajandass/proposal-generator |

## Platform Independence

Both services are Dockerized with no cloud-provider-specific dependencies.
Can deploy to AWS, GCP, Railway, Render, Fly.io, or any VPS.
