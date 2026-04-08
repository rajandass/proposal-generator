import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock
from main import app

MOCK_PROPOSAL = {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "status": "signed",
    "token": "tok123",
    "price": 5000.0,
    "client_name": "Acme",
    "client_email": "acme@example.com",
}


@pytest.mark.asyncio
async def test_create_razorpay_order():
    mock_order = {"id": "order_abc123", "amount": 500000, "currency": "INR"}

    with patch("api.razorpay.get_supabase") as mock_sb, \
         patch("api.razorpay.razorpay_client") as mock_rz:

        mock_sb.return_value.table.return_value.select.return_value\
            .eq.return_value.single.return_value.execute.return_value.data = MOCK_PROPOSAL
        mock_sb.return_value.table.return_value.insert.return_value\
            .execute.return_value.data = [{"id": "payment-uuid"}]
        mock_rz.order.create.return_value = mock_order

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/razorpay/create-order",
                json={"proposal_token": "tok123"}
            )
        assert response.status_code == 200
        assert response.json()["order_id"] == "order_abc123"
        assert response.json()["amount"] == 500000
