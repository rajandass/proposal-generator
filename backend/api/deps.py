import os
import logging
from fastapi import HTTPException, Header
from supabase import create_client, Client

logger = logging.getLogger(__name__)

_anon_client: Client | None = None


def _get_anon_client() -> Client:
    global _anon_client
    if _anon_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
        _anon_client = create_client(url, key)
    return _anon_client


async def get_current_user(authorization: str = Header(...)) -> dict:
    """Extract and verify Supabase JWT, return user dict."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        supabase = _get_anon_client()
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user.user.id, "email": user.user.email}
    except HTTPException:
        raise
    except Exception as e:
        logger.debug("Auth verification failed: %s", e)
        raise HTTPException(status_code=401, detail="Invalid or expired token")
