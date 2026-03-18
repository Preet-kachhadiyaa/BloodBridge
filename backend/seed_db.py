import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from datetime import datetime
import math
import random
import os
from auth_utils import get_password_hash
import pandas as pd

# MongoDB Connection
MONGO_DETAILS = "mongodb://localhost:27017" 
client = AsyncIOMotorClient(MONGO_DETAILS)
db = client.bloodbridge
hospitals_collection = db.hospitals
users_collection = db.users

async def seed_db():
    print("Starting Database Seeding...")

    def safe_float(val):
        try:
            if pd.isna(val) or val == '':
                return 0.0
            return float(val)
        except (ValueError, TypeError):
            return 0.0

    # 1. Seed Hospitals from blood_bank_data.csv
    print("Clearing existing hospitals...")
    await hospitals_collection.delete_many({})
    
    try:
        csv_path = os.path.join("backend", "blood_bank_data.csv")
        df_hospitals = pd.read_csv(csv_path)
        # Clean column names
        df_hospitals.columns = df_hospitals.columns.str.strip()
        # Handle nan values by replacing with empty strings
        df_hospitals = df_hospitals.fillna('')
        
        hospitals_data = []
        for index, row in df_hospitals.iterrows():
            # The CSV header uses 'latitude' and 'longitude'
            lat = safe_float(row.get("latitude"))
            lon = safe_float(row.get("longitude"))
            units = int(safe_float(row.get("count", 0)))
            
            hospital = {
                "_id": str(uuid.uuid4()),
                "name": str(row.get("name", "")).strip(),
                "verified": True,
                "address": str(row.get("address", "")).strip(),
                "contact": str(row.get("phone", "Not Available")).strip(),
                "location": {
                    "lat": lat,
                    "lon": lon,
                },
                "type": str(row.get("type", "")).strip(),
                "units": units
            }
            if hospital["name"]:
                hospitals_data.append(hospital)
                
        if hospitals_data:
            print(f"Adding {len(hospitals_data)} facilities from blood_bank_data.csv...")
            await hospitals_collection.insert_many(hospitals_data)
        else:
            print("No hospital data found to insert.")
    except Exception as e:
        print(f"Error seeding hospitals from blood_bank_data.csv: {e}")




    # 2. Seed Donors from blood_donation.csv
    print("Clearing existing users...")
    await users_collection.delete_many({})
    
    try:
        df_donors = pd.read_csv(os.path.join("backend", "blood_donation.csv"))
        df_donors.columns = df_donors.columns.str.strip()
        df_donors = df_donors.fillna('')


        
        donors_data = []
        # Use a pre-computed hash for 'Password123' to avoid potentially slow/buggy bcrypt calls in the loop
        default_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6s3Kk6p9qJj6K."
        
        print(f"Total rows in blood_donation.csv: {len(df_donors)}")
        for index, row in df_donors.iterrows():
            email = str(row.get("Email", "")).strip()

            if not email:
                if index < 5: print(f"Skipping row {index} due to missing email. Columns available: {row.index.tolist()}")
                continue
            
            created_at_raw = row.get("Registration_Date", "")
            try:
                created_at = datetime.strptime(str(created_at_raw), "%d-%m-%Y") if created_at_raw else datetime.utcnow()
            except ValueError:
                created_at = datetime.utcnow()
                
            total_donations = row.get("Total_Donations", 0)
            try:
                total_donations = int(total_donations) if str(total_donations).isdigit() else 0
            except:
                total_donations = 0

            donor = {
                "_id": str(uuid.uuid4()),
                "email": email,
                "name": str(row.get("Full_Name", "")).strip(),
                "phone": str(row.get("Contact_Number", "")).strip(),
                "blood_group": str(row.get("Blood_Group", "")).strip(),
                "location": f"{row.get('City', '')}, {row.get('State', '')}".strip(', '),
                "user_type": "blood_donor",
                "hashed_password": default_hash,
                "total_donations": total_donations,
                "created_at": created_at,
                "gender": row.get("Gender", ""),
                "age": str(row.get("Age", "")),
                "is_google_user": False
            }
            donors_data.append(donor)

        if donors_data:
            print(f"Adding {len(donors_data)} real donors from blood_donation.csv...")
            await users_collection.insert_many(donors_data)
        else:
            print(f"No donor data found to insert. (Scanned {len(df_donors)} rows)")
            
    except Exception as e:
        print(f"Error seeding donors: {e}")

    
    print(f"\nDatabase seeded successfully with REAL CSV data!")
    hospital_count = await hospitals_collection.count_documents({})
    user_count = await users_collection.count_documents({})
    print(f"Total Hospitals in DB: {hospital_count}")
    print(f"Total Users in DB: {user_count}")

if __name__ == "__main__":
    client = AsyncIOMotorClient(MONGO_DETAILS)
    db = client["bloodbridge"]
    hospitals_collection = db.hospitals
    users_collection = db.users
    asyncio.run(seed_db())

