# Proposal Generator

AI-powered proposal generation platform for software development freelancers and agencies.

## What it does

- Generate professional proposals using AI (OpenAI or Anthropic) from a short brief
- Share proposals as public, authenticated-free pages with unique URLs
- Collect e-signatures (type or draw)
- Accept payments via Razorpay (India)

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Python FastAPI |
| Database + Auth | Supabase (PostgreSQL + Supabase Auth) |
| AI | OpenAI GPT-4o or Anthropic Claude (env var switch) |
| Payments | Razorpay |
| Containers | Docker + docker-compose |
| CI/CD | GitHub Actions → GHCR |

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- Supabase account
- Razorpay account (test keys for dev)

### Setup

1. Clone the repo
```bash
git clone https://github.com/rajandass/proposal-generator.git
cd proposal-generator
```

2. Copy env file and fill in values
```bash
cp .env.example .env
```

3. Start all services
```bash
docker-compose up --build
```

4. Frontend: http://localhost:3000
5. Backend API: http://localhost:8000
6. API Docs: http://localhost:8000/docs

## Environment Variables

See `.env.example` for all required variables.

## Project Structure

```
proposal-generator/
├── frontend/        # Next.js app
├── backend/         # FastAPI app
├── docs/            # Design specs and plans
├── .github/         # CI/CD workflows
└── docker-compose.yml
```

## Deployment

Both services are Dockerized with no cloud-provider-specific dependencies.
Deploy to any VPS, AWS, GCP, Railway, Render, or Fly.io.

## GitHub Actions Secrets

Add these secrets in GitHub → Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_API_URL` | Your deployed backend URL |
