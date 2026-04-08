from fastapi import APIRouter, Depends, HTTPException
from api.deps import get_current_user
from db.client import get_supabase
from models.proposal import ProposalCreate
from ai.provider import generate_proposal
from nanoid import generate as nanoid_generate

router = APIRouter()


@router.post("/")
async def generate_proposal_endpoint(
    body: ProposalCreate,
    user: dict = Depends(get_current_user)
):
    supabase = get_supabase()

    # Fetch user profile to pre-fill about_us and contact
    profile_result = supabase.table("user_profiles")\
        .select("*").eq("id", user["id"]).execute()
    profile = profile_result.data[0] if profile_result.data else {}

    context = {
        "client_name": body.client_name,
        "price": body.price,
        "company_name": profile.get("company_name", ""),
        "about_blurb": profile.get("about_blurb", ""),
        "contact": {
            "company": profile.get("company_name", ""),
            "address": profile.get("address", ""),
            "phone": profile.get("phone", ""),
            "email": profile.get("email", user["email"]),
        }
    }

    try:
        content = await generate_proposal(body.brief, context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    token = nanoid_generate(size=12)

    insert_data = {
        "user_id": user["id"],
        "token": token,
        "client_name": body.client_name,
        "client_email": body.client_email,
        "title": body.title,
        "price": body.price,
        "content": content.model_dump(),
        "status": "draft",
    }

    result = supabase.table("proposals").insert(insert_data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save proposal")

    return result.data[0]
