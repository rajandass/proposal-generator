import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from main import app
from models.proposal import ProposalContent, ScopeOfWork, TimelineItem, ExpenditureItem, ContactInfo

MOCK_USER = {"id": "user-123", "email": "test@example.com"}
MOCK_CONTENT = ProposalContent(
    executive_summary="Test summary",
    scope_of_work=ScopeOfWork(deliverables=["Website"], resources=["Dev"]),
    timeline=[TimelineItem(phase="Design", duration="2 weeks")],
    expenditure=[ExpenditureItem(description="Design", cost=2000.0, tax_rate=0.18)],
    about_us="We build great software",
    contact=ContactInfo(company="Us", address="123 St", phone="999", email="us@us.com")
)


@pytest.mark.asyncio
async def test_generate_proposal():
    with patch("api.generate.get_supabase") as mock_sb, \
         patch("api.generate.generate_proposal", new_callable=AsyncMock, return_value=MOCK_CONTENT):

        mock_sb.return_value.table.return_value.select.return_value\
            .eq.return_value.execute.return_value.data = []
        mock_sb.return_value.table.return_value.insert.return_value\
            .execute.return_value.data = [{
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "token": "tok123",
                "user_id": "user-123",
                "client_name": "Acme",
                "client_email": "acme@example.com",
                "title": "New Site",
                "status": "draft",
                "price": 5000.0,
                "content": MOCK_CONTENT.model_dump(),
                "created_at": "2026-04-08T00:00:00",
                "updated_at": "2026-04-08T00:00:00",
            }]

        from api.deps import get_current_user
        app.dependency_overrides[get_current_user] = lambda: MOCK_USER

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/generate/",
                json={
                    "client_name": "Acme",
                    "client_email": "acme@example.com",
                    "title": "New Site",
                    "price": 5000,
                    "brief": "Build a website for our company"
                },
                headers={"Authorization": "Bearer fake-token"}
            )

        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert "id" in response.json()
