---
paths:
  - "backend/api/**/*"
  - "frontend/app/p/**/*"
  - "backend/db/**/*"
---

# Security Conventions

## Secrets
- Never hardcode API keys, secrets, or tokens in code
- All secrets via environment variables — see `environment.md`
- `.env` is gitignored — never commit it
- Use `.env.example` with placeholder values for documentation

## Supabase
- Backend always uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS — be careful)
- Frontend always uses `SUPABASE_ANON_KEY` (respects RLS)
- RLS policies are the last line of defense — always verify they're enabled on new tables
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend

## Razorpay Webhook Verification
Always verify the webhook signature before processing — prevents spoofed payment events:
```python
import hmac, hashlib

expected = hmac.new(
    webhook_secret.encode(),
    body_bytes,
    hashlib.sha256
).hexdigest()

if not hmac.compare_digest(expected, signature):
    raise HTTPException(status_code=400, detail="Invalid webhook signature")
```

## Public Routes
These routes have no auth — be careful what data they expose:
- `GET /api/proposals/public/{token}` — only returns `published/signed/paid` proposals
- `POST /api/sign/` — validates proposal is in `published` state before accepting
- `POST /api/razorpay/*` — validates proposal state before creating order

## Input Validation
- All inputs validated via Pydantic models before reaching business logic
- Email fields use `EmailStr` type
- Status fields use `CHECK` constraints in the database

## CORS
- Backend only allows requests from `FRONTEND_URL` env var
- Never use `allow_origins=["*"]` in production
