from fastapi import APIRouter, HTTPException, Request
from db.client import get_supabase
from models.signature import SignatureCreate

router = APIRouter()


@router.post("/")
async def sign_proposal(body: SignatureCreate, request: Request):
    """Public endpoint — no auth required."""
    supabase = get_supabase()

    # Fetch proposal by token
    result = supabase.table("proposals")\
        .select("*").eq("token", body.proposal_token).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposal = result.data

    if proposal["status"] not in ("published",):
        raise HTTPException(status_code=400, detail="Proposal cannot be signed in its current state")

    ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")

    # Insert signature
    supabase.table("signatures").insert({
        "proposal_id": proposal["id"],
        "signer_name": body.signer_name,
        "signer_email": body.signer_email,
        "signature_data": body.signature_data,
        "signature_type": body.signature_type,
        "ip_address": ip,
    }).execute()

    # Update proposal status to signed
    supabase.table("proposals")\
        .update({"status": "signed"})\
        .eq("id", proposal["id"])\
        .execute()

    return {"success": True, "proposal_id": proposal["id"]}
