from fastapi import APIRouter, Depends
from database import users_collection
from .auth import get_current_user
from typing import Dict

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/stats", response_model=Dict)
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    """Fetch basic user stats (non-donation)."""
    return {"total_donations": 0, "certificates": 0, "appointments": 0, "visits": 0}
