from fastapi import APIRouter
from typing import List, Optional
import csv
import os

router = APIRouter(prefix="/utils", tags=["Utilities"])

import httpx
import asyncio

# Cache cities in memory
CACHED_CITIES: List[str] = []

async def refresh_cities_cache():
    global CACHED_CITIES
    try:
        # Fetch all countries and their cities for a global "All City" experience
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://countriesnow.space/api/v0.1/countries",
                timeout=20.0
            )
            if response.status_code == 200:
                data = response.json()
                if not data.get("error"):
                    all_cities = []
                    for country_data in data.get("data", []):
                        all_cities.extend(country_data.get("cities", []))
                    
                    # Store unique cities, removing duplicates if any
                    CACHED_CITIES = sorted(list(set(all_cities)))
                    print(f"Loaded {len(CACHED_CITIES)} global cities from API.")
                    return
    except Exception as e:
        print(f"Error refreshing global cities from API: {e}")
    
    # Fallback if API fails
    if not CACHED_CITIES:
        CACHED_CITIES = ["Mumbai", "New York", "London", "Dubai", "Singapore", "Sydney", "Toronto", "Berlin", "Paris", "Tokyo"]

# Initial load (non-blocking)
asyncio.create_task(refresh_cities_cache())

@router.get("/cities", response_model=List[str])
async def get_cities(q: Optional[str] = None):
    """Returns a list of cities from CSV, optionally filtered by query"""
    if q:
        q = q.lower()
        # Limit results for performance
        matches = []
        for city in CACHED_CITIES:
            if q in city.lower():
                matches.append(city)
                if len(matches) >= 20: # Return top 20 matches
                    break
        return matches
    return list(CACHED_CITIES[:20])
