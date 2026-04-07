# Proposal Generator Platform — Design Spec
**Date:** 2026-04-07  
**Status:** Approved

---

## Context

A multi-tenant SaaS platform that lets software development freelancers/agencies generate high-quality client proposals using AI, send them as public shareable pages, collect e-signatures, and receive payments — all in one flow. The platform replaces manual proposal writing (Notion docs, Word files) and the need for separate tools like PandaDoc, DocuSign, and Razorpay invoicing. Payment is via Razorpay (India), single account — all funds go to the platform owner's Razorpay account.

The template structure is based on a proven web development proposal format with 6 sections: Executive Summary, Scope of Work, Timeline, Expenditure, About Us, and Contact.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Python FastAPI |
| Database + Auth | Supabase (PostgreSQL + Supabase Auth) |
| AI | OpenAI GPT-4o or Anthropic Claude (swappable via env var) |
| Payments | Razorpay (one-time payment, India) |
| Containerization | Docker (both services) |
| CI/CD | GitHub Actions → GHCR → deploy |
| Version Control | Git |

**Platform independence:** Both services are Dockerized. No cloud-provider-specific dependencies. Can deploy to AWS, GCP, Railway, Render, Fly.io, or any VPS.

---

## Architecture

```
┌─────────────────────────────────────┐
│         Next.js Frontend            │
│  /dashboard  (auth required)        │
│  /p/[token]  (public, no auth)      │
└──────────────┬──────────────────────┘
               │ HTTP REST
┌──────────────▼──────────────────────┐
│         FastAPI Backend             │
│  /api/proposals  CRUD               │
│  /api/generate   AI generation      │
│  /api/sign       Save signatures    │
│  /api/razorpay/* Payment + webhooks │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  AI Provider Abstraction    │    │
│  │  OpenAI GPT-4o  ──┐        │    │
│  │                    ├─ LLM   │    │
│  │  Anthropic Claude ─┘        │    │
│  └─────────────────────────────┘    │
└──────┬──────────────────────────────┘
       │
┌──────▼──────┐
│  Supabase   │
│  Auth + DB  │
└─────────────┘
```

**AI provider switching:** `AI_PROVIDER=openai` or `AI_PROVIDER=anthropic` in `.env`. Both implement the same internal `generate_proposal(brief: str, context: dict) -> ProposalContent` interface.

---

## Data Model

### `proposals`
```sql
id           uuid PRIMARY KEY
user_id      uuid REFERENCES auth.users
token        text UNIQUE  -- public URL slug (nanoid)
client_name  text
client_email text
title        text
status       text  -- draft | published | signed | paid
price        numeric
content      jsonb -- AI-generated sections (see below)
created_at   timestamptz
updated_at   timestamptz
```

**`content` JSONB schema:**
```json
{
  "executive_summary": "string",
  "scope_of_work": {
    "deliverables": ["string"],
    "resources": ["string"]
  },
  "timeline": [
    { "phase": "string", "duration": "string" }
  ],
  "expenditure": [
    { "description": "string", "cost": number, "tax_rate": number }
  ],
  "about_us": "string",
  "contact": {
    "company": "string",
    "address": "string",
    "phone": "string",
    "email": "string"
  }
}
```

### `signatures`
```sql
id             uuid PRIMARY KEY
proposal_id    uuid REFERENCES proposals
signer_name    text
signer_email   text
signature_data text  -- base64 canvas PNG or typed name string
signature_type text  -- "drawn" | "typed"
signed_at      timestamptz
ip_address     text
```

### `user_profiles`
```sql
id           uuid PRIMARY KEY REFERENCES auth.users
company_name text
address      text
phone        text
email        text
about_blurb  text  -- short company bio for "About Us" section
updated_at   timestamptz
```
Populated once during onboarding (prompted on first login). Pre-filled into every new proposal's `about_us` and `contact` sections. User can edit per-proposal in the editor.

### `payments`
```sql
id                       uuid PRIMARY KEY
proposal_id              uuid REFERENCES proposals
razorpay_order_id        text
razorpay_payment_id      text
amount                   numeric
currency                 text
status                   text  -- pending | succeeded | failed
paid_at                  timestamptz
```

---

## Pages & Routes

### Authenticated (Next.js — requires Supabase session)

| Route | Description |
|---|---|
| `/` | Redirect to `/dashboard` or `/login` |
| `/login` | Supabase Auth — email/password |
| `/onboarding` | First-login profile setup: company name, address, phone, email, about blurb |
| `/settings` | Edit company profile (same fields as onboarding) |
| `/dashboard` | Lists all proposals: title, client, status, date. "New Proposal" button |
| `/proposals/new` | Brief input form: client name, client email, price, 1-2 para description → triggers AI |
| `/proposals/[id]/edit` | Rich text editor for reviewing/editing AI-generated proposal before publishing |

### Public (no auth required)

| Route | Description |
|---|---|
| `/p/[token]` | Full rendered proposal page. Sticky "Sign & Pay" CTA |
| `/p/[token]/success` | Post-payment success page with animation |

---

## User Flows

### Proposal Creation Flow
```
Dashboard
  → "New Proposal" button
  → /proposals/new: fill client name, email, price, brief (1-2 paragraphs)
  → POST /api/generate → FastAPI calls LLM → returns full ProposalContent
  → Redirect to /proposals/[id]/edit
  → User reviews/edits all 6 sections in rich text editor
  → "Publish" button → status = published
  → Shareable link displayed: app.com/p/[token]
  → User copies link, sends to client
```

### Client Signing & Payment Flow
```
Client opens /p/[token]
  → Views full proposal (no auth)
  → Clicks "Sign & Pay"
  → Signature modal:
      Tab 1: Type name → renders in cursive font
      Tab 2: Draw on canvas
      + signer email field
  → "Continue to Payment" button
  → POST /api/sign → signature saved, proposal status = signed
  → POST /api/razorpay/create-order → Razorpay order created
  → Client redirected to Razorpay hosted checkout
  → Payment completed
  → Razorpay webhook → POST /api/razorpay/webhook → proposal status = paid
  → Client redirected to /p/[token]/success
  → Confetti/Lottie animation + thank-you message
```

---

## AI Generation

**Input (from brief form):**
- `client_name`: string
- `client_email`: string  
- `price`: number
- `brief`: 1-2 paragraph description of the project

**System prompt context includes:**
- Template section structure
- Software development industry defaults
- Instruction to output structured JSON matching the `content` schema

**Provider abstraction (FastAPI):**
```python
# ai/provider.py
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")  # "openai" | "anthropic"

async def generate_proposal(brief: str, context: dict) -> ProposalContent:
    if AI_PROVIDER == "anthropic":
        return await _generate_anthropic(brief, context)
    return await _generate_openai(brief, context)
```

Models:
- OpenAI: `gpt-4o`
- Anthropic: `claude-sonnet-4-6`

---

## Razorpay Integration

- **Type:** One-time payment order (no subscriptions)
- **Region:** India — supports UPI, cards, net banking, wallets
- **Account:** Single Razorpay account (platform owner receives all funds)
- **Flow:** Server-side order creation → Razorpay hosted checkout → webhook confirmation
- **Webhook endpoint:** `POST /api/razorpay/webhook`
- **Idempotency:** Webhook handler checks existing payment status before updating
- **Success redirect:** `/p/[token]/success`
- **Cancel redirect:** `/p/[token]` (back to proposal)

---

## CI/CD Pipeline (GitHub Actions)

```
On push to main:
  1. Run tests
     - pytest (FastAPI backend)
     - jest (Next.js frontend)
  2. Build Docker images
     - frontend: Dockerfile in /frontend
     - backend: Dockerfile in /backend
  3. Push to GHCR (ghcr.io/[org]/proposal-[service])
  4. Deploy (webhook or SSH — provider-agnostic step)
```

---

## Project Structure

```
proposal-generator/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── dashboard/
│   │   ├── proposals/
│   │   │   ├── new/
│   │   │   └── [id]/edit/
│   │   └── p/
│   │       └── [token]/
│   ├── components/
│   ├── Dockerfile
│   └── package.json
├── backend/                   # FastAPI app
│   ├── api/
│   │   ├── proposals.py
│   │   ├── generate.py
│   │   ├── sign.py
│   │   └── razorpay.py
│   ├── ai/
│   │   └── provider.py
│   ├── models/
│   ├── Dockerfile
│   └── requirements.txt
├── docs/
│   └── superpowers/specs/
│       └── 2026-04-07-proposal-generator-design.md
├── .github/
│   └── workflows/
│       └── ci.yml
└── docker-compose.yml
```

---

## Verification

End-to-end test checklist:
1. Sign up / log in via Supabase Auth
2. Dashboard loads with empty proposal list
3. Click "New Proposal" — fill brief, submit
4. AI generates proposal (check all 6 sections populated)
5. Edit proposal in editor, publish
6. Copy shareable link — open in incognito (no auth)
7. Proposal page renders correctly
8. Click "Sign & Pay" — test both type and draw signature
9. Razorpay test mode checkout completes
10. Webhook fires → proposal status = paid
11. Success animation appears
12. Dashboard reflects updated proposal status
