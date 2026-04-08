import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock
from main import app
from api.deps import get_current_user

MOCK_USER = {"id": "user-123", "email": "test@example.com"}
MOCK_PROPOSAL = {
    "id": "00000000-0000-0000-0000-000000000001",
    "user_id": "00000000-0000-0000-0000-000000000002",
    "token": "abc123",
    "client_name": "Acme Corp",
    "client_email": "client@acme.com",
    "title": "Website Redesign",
    "status": "draft",
    "price": 5000.0,
    "content": {
        "executive_summary": "Test summary",
        "scope_of_work": {"deliverables": ["Website"], "resources": ["Dev"]},
        "timeline": [{"phase": "Design", "duration": "2 weeks"}],
        "expenditure": [{"description": "Design", "cost": 2000.0, "tax_rate": 0.18}],
        "about_us": "We are great",
        "contact": {"company": "Us", "address": "123 St", "phone": "999", "email": "us@us.com"}
    },
    "created_at": "2026-04-07T00:00:00",
    "updated_at": "2026-04-07T00:00:00",
}


@pytest.mark.asyncio
async def test_list_proposals():
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER
    try:
        with patch("api.proposals.get_supabase") as mock_sb:
            mock_sb.return_value.table.return_value.select.return_value\
                .eq.return_value.order.return_value.execute.return_value.data = [MOCK_PROPOSAL]

            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.get(
                    "/api/proposals/",
                    headers={"Authorization": "Bearer fake-token"}
                )
        assert response.status_code == 200
        assert len(response.json()) == 1
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_public_proposal():
    published_proposal = {**MOCK_PROPOSAL, "status": "published"}
    with patch("api.proposals.get_supabase") as mock_sb:
        mock_sb.return_value.table.return_value.select.return_value\
            .eq.return_value.single.return_value.execute.return_value.data = published_proposal

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/proposals/public/abc123")
        assert response.status_code == 200
        assert response.json()["token"] == "abc123"
