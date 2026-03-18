import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "bloodbridge")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# Collections
users_collection = db.get_collection("users")
hospitals_collection = db.get_collection("hospitals")
blood_stock_collection = db.get_collection("blood_stock")
requests_collection = db.get_collection("blood_requests")
donations_collection = None
appointments_collection = None
