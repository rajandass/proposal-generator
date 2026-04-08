import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch
from main import app

MOCK_PROPOSAL = {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "published",
    "token": "tok123",
}


@pytest.mark.asyncio
async def test_sign_proposal():
    with patch("api.sign.get_supabase") as mock_sb:
        # Fetch proposal by token
        mock_sb.return_value.table.return_value.select.return_value\
            .eq.return_value.single.return_value.execute.return_value.data = MOCK_PROPOSAL
        # Insert signature
        mock_sb.return_value.table.return_value.insert.return_value\
            .execute.return_value.data = [{"id": "sig-uuid"}]
        # Update proposal status
        mock_sb.return_value.table.return_value.update.return_value\
            .eq.return_value.execute.return_value.data = [MOCK_PROPOSAL]

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/sign/",
                json={
                    "proposal_token": "tok123",
                    "signer_name": "John Doe",
                    "signer_email": "john@example.com",
                    "signature_data": "data:image/png;base64,abc123",
                    "signature_type": "drawn"
                },
                headers={"X-Forwarded-For": "1.2.3.4"}
            )
        assert response.status_code == 200
        assert response.json()["success"] is True


@pytest.mark.asyncio
async def test_sign_already_signed():
    with patch("api.sign.get_supabase") as mock_sb:
        mock_sb.return_value.table.return_value.select.return_value\
            .eq.return_value.single.return_value.execute.return_value.data = {
                **MOCK_PROPOSAL, "status": "signed"
            }

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/sign/",
                json={
                    "proposal_token": "tok123",
                    "signer_name": "John Doe",
                    "signer_email": "john@example.com",
                    "signature_data": "abc",
                    "signature_type": "typed"
                }
            )
        assert response.status_code == 400
