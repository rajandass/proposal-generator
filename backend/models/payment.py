from pydantic import BaseModel


class CreateOrderRequest(BaseModel):
    proposal_token: str


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int  # in paise
    currency: str
    key_id: str
