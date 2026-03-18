from fastapi import APIRouter, HTTPException, Depends
from database import hospitals_collection
from typing import List
import uuid
from schemas import HospitalCreate

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

@router.get("/nearby")
async def get_nearby_hospitals(lat: float, lon: float, limit: int = 5):
    # In a real app, this would use MongoDB $near sphere query
    # For now, we return real structured data from the DB
    cursor = hospitals_collection.find().limit(limit)
    hospitals = await cursor.to_list(length=limit)
    
    # Mock distance for now if not using geospatial index
    for h in hospitals:
        h["distance"] = "1.5 km"
    return hospitals

@router.get("/")
async def list_hospitals():
    cursor = hospitals_collection.find()
    return await cursor.to_list(length=100)

@router.post("/")
async def create_hospital(profile: HospitalCreate):
    hospital = profile.model_dump()
    hospital["_id"] = str(uuid.uuid4())
    hospital["verified"] = False
    await hospitals_collection.insert_one(hospital)
    return hospital
