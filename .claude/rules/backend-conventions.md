---
description: FastAPI backend coding conventions and patterns
---

# Backend Conventions (FastAPI)

## Routing
- All routes prefixed with `/api/`
- Use async functions throughout — no sync I/O
- Router files live in `backend/api/`, one file per domain

## Authentication
- Verify Supabase JWT on all protected routes via `Authorization: Bearer <token>` header
- Auth dependency in `backend/api/deps.py` → `get_current_user()`
- **Public routes (no auth required):**
  - `GET /api/proposals/public/{token}`
  - `POST /api/sign/`
  - `POST /api/razorpay/*`

## Models
- All request/response shapes defined as Pydantic models in `backend/models/`
- Use `model_dump()` (not `.dict()`) — Pydantic v2

## Database
- Supabase client singleton in `backend/db/client.py` → `get_supabase()`
- Use service role key for backend operations (bypasses RLS)
- Use anon key only for auth token verification

## AI Provider
- Provider abstraction in `backend/ai/provider.py`
- Switch via env var: `AI_PROVIDER=openai` or `AI_PROVIDER=anthropic`
- Models: OpenAI `gpt-4o`, Anthropic `claude-sonnet-4-6`
- Both providers implement same interface: `generate_proposal(brief, context) -> ProposalContent`

## Proposal Status Flow
`draft` → `published` → `signed` → `paid`

## Error Handling
- Raise `HTTPException` with appropriate status codes
- 404 for not found, 400 for bad state, 401 for auth, 500 for server errors

## Testing
- pytest + httpx AsyncClient
- TDD: write failing test first, run to confirm failure, implement, run to confirm pass
- Mock Supabase calls with `unittest.mock.patch`
- Test files in `backend/tests/test_<module>.py`
