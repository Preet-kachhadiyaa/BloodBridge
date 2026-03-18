from fastapi import APIRouter, HTTPException
from database import hospitals_collection, users_collection
from typing import List, Optional
import math

router = APIRouter(prefix="/search", tags=["Search"])

def calculate_distance(lat1, lon1, lat2, lon2):
    # Basic Haversine distance core logic
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("/")
async def search_blood(lat: float, lon: float, blood_group: str, component: Optional[str] = "Whole Blood"):
    """
    Search for both hospitals with blood stock and nearby registered donors.
    """
    # Handle URL encoding quirk where '+' is decoded as ' '
    blood_group = blood_group.replace(' ', '+')
    
    try:

        lat_min = lat - 0.5
        lat_max = lat + 0.5
        lon_min = lon - 0.5
        lon_max = lon + 0.5

        # 1. Search Hospitals using Bounding Box (fast without GeoJSON index)
        hospital_query = {
            "location.lat": {"$gte": lat_min, "$lte": lat_max},
            "location.lon": {"$gte": lon_min, "$lte": lon_max}
        }
        all_hospitals = await hospitals_collection.find(hospital_query).to_list(length=500)
        
        hospital_results = []
        for h in all_hospitals:
            loc = h.get("location", {})
            if not loc: continue
            h_lat = loc.get("lat", 0)
            h_lon = loc.get("lon", 0)
            
            dist = calculate_distance(lat, lon, h_lat, h_lon)
            hospital_results.append({
                "name": h.get("name", "Unknown Facility"),
                "address": h.get("address", ""),
                "distance": dist,
                "units": h.get("units", 0),
                "contact": h.get("contact", "Not Available")
            })

        
        # Sort and take top 10
        hospital_results.sort(key=lambda x: x["distance"])
        hospital_results = hospital_results[:10]

        # Format distance
        for h in hospital_results:
            h["distance"] = f"{h['distance']:.1f} km"

        # 2. Search Donors (Users with user_type 'blood_donor' or 'both')
        # Seeded CSV data for donors doesn't have lat/lon so we mock distance
        donor_query = {
            "blood_group": blood_group,
            "user_type": {"$in": ["blood_donor", "both"]}
        }
        donors = await users_collection.find(donor_query).to_list(length=10)
        donor_results = []
        for d in donors:
            dist = 1.2 # Mock distance
            donor_results.append({
                "name": d.get("name", "Generous Donor"),
                "blood_group": d.get("blood_group", blood_group),
                "distance": f"{dist} km",
                "phone": d.get("phone", "Not Provided")
            })

        return {
            "hospitals": hospital_results,
            "donors": donor_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
