import os
import hmac
import hashlib
import json
from datetime import datetime, timezone
import razorpay
from fastapi import APIRouter, HTTPException, Request
from db.client import get_supabase
from models.payment import CreateOrderRequest, CreateOrderResponse

router = APIRouter()

razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID", ""), os.getenv("RAZORPAY_KEY_SECRET", ""))
)


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_order(body: CreateOrderRequest):
    """Public endpoint — called after client signs."""
    supabase = get_supabase()

    result = supabase.table("proposals")\
        .select("*").eq("token", body.proposal_token).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposal = result.data

    if proposal["status"] != "signed":
        raise HTTPException(status_code=400, detail="Proposal must be signed before payment")

    amount_paise = int(proposal["price"] * 100)  # Razorpay uses paise

    order = razorpay_client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": proposal["token"],
        "notes": {
            "proposal_id": proposal["id"],
            "client_email": proposal["client_email"],
        }
    })

    # Record pending payment
    supabase.table("payments").insert({
        "proposal_id": proposal["id"],
        "razorpay_order_id": order["id"],
        "amount": proposal["price"],
        "currency": "INR",
        "status": "pending",
    }).execute()

    return CreateOrderResponse(
        order_id=order["id"],
        amount=amount_paise,
        currency="INR",
        key_id=os.getenv("RAZORPAY_KEY_ID", ""),
    )


@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """Razorpay calls this after payment — verify signature and update status."""
    body_bytes = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

    # Verify webhook signature
    expected = hmac.new(
        webhook_secret.encode(),
        body_bytes,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = json.loads(body_bytes)
    event = payload.get("event")

    if event != "payment.captured":
        return {"status": "ignored"}

    payment_entity = payload["payload"]["payment"]["entity"]
    order_id = payment_entity.get("order_id")
    razorpay_payment_id = payment_entity.get("id")

    supabase = get_supabase()

    # Find payment record
    payment_result = supabase.table("payments")\
        .select("*, proposals(id)")\
        .eq("razorpay_order_id", order_id)\
        .single().execute()

    if not payment_result.data:
        return {"status": "payment not found"}

    payment = payment_result.data

    # Idempotency: skip if already succeeded
    if payment["status"] == "succeeded":
        return {"status": "already processed"}

    # Update payment
    supabase.table("payments").update({
        "status": "succeeded",
        "razorpay_payment_id": razorpay_payment_id,
        "paid_at": datetime.now(timezone.utc).isoformat(),
    }).eq("razorpay_order_id", order_id).execute()

    # Update proposal status
    supabase.table("proposals").update({"status": "paid"})\
        .eq("id", payment["proposal_id"]).execute()

    return {"status": "ok"}
