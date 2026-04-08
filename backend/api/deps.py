from fastapi import HTTPException, Header
from supabase import create_client
import os


async def get_current_user(authorization: str = Header(...)) -> dict:
    """Extract and verify Supabase JWT, return user dict."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")

    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_ANON_KEY")
    )

    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user.user.id, "email": user.user.email}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
