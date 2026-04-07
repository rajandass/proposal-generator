---
paths:
  - "backend/**/*"
---

# Backend Conventions (FastAPI)

## Routing
- All routes prefixed with `/api/`
- Async functions throughout — no sync I/O
- One router file per domain in `backend/api/`

## Authentication
- Protected routes: verify Supabase JWT via `Authorization: Bearer <token>` header
- Auth dependency: `backend/api/deps.py` → `get_current_user()`
- Public routes (no auth): `GET /api/proposals/public/{token}`, `POST /api/sign/`, `POST /api/razorpay/*`

## Models
- All request/response shapes as Pydantic models in `backend/models/`
- Use `model_dump()` not `.dict()` — Pydantic v2

## Database
- Supabase client singleton: `backend/db/client.py` → `get_supabase()`
- Use service role key in backend (bypasses RLS)
- Use anon key only for JWT verification

## AI Provider
- Abstraction in `backend/ai/provider.py`
- Switch via `AI_PROVIDER=openai|anthropic` in `.env`
- Models: OpenAI `gpt-4o`, Anthropic `claude-sonnet-4-6`
- Interface: `generate_proposal(brief, context) -> ProposalContent`

## Error Handling
- `HTTPException` with appropriate status codes
- 404 not found, 400 bad state, 401 unauthorized, 500 server error

## Testing
- pytest + httpx `AsyncClient` with `ASGITransport`
- TDD: write failing test → confirm fail → implement → confirm pass
- Mock Supabase with `unittest.mock.patch`
- Test files: `backend/tests/test_<module>.py`
