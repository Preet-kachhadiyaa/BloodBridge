from fastapi import APIRouter, HTTPException, Depends
from database import blood_stock_collection
from datetime import datetime
import uuid
from schemas import StockUpdate

router = APIRouter(prefix="/blood-stock", tags=["Blood Stock"])

@router.get("/")
async def get_all_stock():
    cursor = blood_stock_collection.find()
    return await cursor.to_list(length=1000)

@router.get("/{hospital_id}")
async def get_hospital_stock(hospital_id: str):
    cursor = blood_stock_collection.find({"hospital_id": hospital_id})
    return await cursor.to_list(length=100)

@router.post("/update")
async def update_stock(stock_data: StockUpdate):
    data = stock_data.model_dump()
    # data: { hospital_id, blood_group, component, units }
    existing = await blood_stock_collection.find_one({
        "hospital_id": data["hospital_id"],
        "blood_group": data["blood_group"],
        "component": data["component"]
    })
    
    if existing:
        new_units = existing["units"] + data["units"]
        await blood_stock_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {"units": max(0, new_units), "last_updated": datetime.utcnow()}}
        )
        return {"message": "Stock updated", "units": max(0, new_units)}
    else:
        new_item = {
            "_id": str(uuid.uuid4()),
            "hospital_id": data["hospital_id"],
            "blood_group": data["blood_group"],
            "component": data["component"],
            "units": max(0, data["units"]),
            "last_updated": datetime.utcnow()
        }
        await blood_stock_collection.insert_one(new_item)
        return new_item
