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

Both services are fully Dockerized — no cloud-provider lock-in. Deploy to AWS, GCP, Railway, Render, Fly.io, or any VPS.
