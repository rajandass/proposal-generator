from fastapi import APIRouter, Depends, HTTPException
from api.deps import get_current_user
from db.client import get_supabase
from models.proposal import ProposalResponse, ProposalUpdate

router = APIRouter()


@router.get("/", response_model=list[ProposalResponse])
async def list_proposals(user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("proposals")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/public/{token}")
async def get_public_proposal(token: str):
    """Public endpoint — no auth required. Returns published/signed/paid proposals."""
    supabase = get_supabase()
    result = (
        supabase.table("proposals")
        .select("*")
        .eq("token", token)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Proposal not found")
    proposal = result.data
    if proposal["status"] not in ("published", "signed", "paid"):
        raise HTTPException(status_code=403, detail="Proposal not available")
    return proposal


@router.get("/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(proposal_id: str, user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("proposals")
        .select("*")
        .eq("id", proposal_id)
        .eq("user_id", user["id"])
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return result.data


@router.patch("/{proposal_id}", response_model=ProposalResponse)
async def update_proposal(
    proposal_id: str,
    body: ProposalUpdate,
    user: dict = Depends(get_current_user)
):
    supabase = get_supabase()
    update_data = body.model_dump(exclude_none=True)
    if "content" in update_data:
        update_data["content"] = body.content.model_dump()

    result = (
        supabase.table("proposals")
        .update(update_data)
        .eq("id", proposal_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return result.data[0]


@router.delete("/{proposal_id}", status_code=204)
async def delete_proposal(proposal_id: str, user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    supabase.table("proposals").delete()\
        .eq("id", proposal_id).eq("user_id", user["id"]).execute()
