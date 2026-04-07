---
paths:
  - "backend/tests/**/*"
  - "frontend/**/*.test.*"
  - "frontend/**/*.spec.*"
  - "frontend/__tests__/**/*"
---

# Testing Conventions

## Philosophy
- TDD: write failing test → confirm it fails → implement → confirm it passes
- Tests verify behavior, not implementation details
- Never mock what you can test directly

## Backend (pytest + httpx)

### Setup
```python
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch
from main import app

@pytest.mark.asyncio
async def test_something():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/endpoint")
    assert response.status_code == 200
```

### Patterns
- Mock Supabase with `patch("api.<module>.get_supabase")`
- Mock auth with `patch("api.deps.get_current_user", return_value={"id": "user-123", "email": "test@example.com"})`
- Mock AI provider with `patch("api.generate.generate_proposal", new_callable=AsyncMock)`
- Test files: `backend/tests/test_<module>.py`
- Run: `pytest -v` from `backend/`

### What to test per endpoint
- Happy path (200/201)
- Auth failure (401) for protected routes
- Not found (404)
- Bad state (400) — e.g. signing an already-signed proposal

## Frontend (Jest + React Testing Library)

### Patterns
- Test user interactions, not component internals
- Prefer `getByRole`, `getByLabelText` over `getByTestId`
- Mock `fetch` calls at the boundary

### Run
```bash
cd frontend && npm test
```

## CI
Both test suites run on every push via GitHub Actions before Docker build.
Never skip tests to fix a CI failure — fix the root cause.
