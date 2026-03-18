# Main entry point for the BloodBridge FastAPI Backend
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import db
from routes import auth, hospitals, blood_stock, ai, utils, search, users

# Initialize FastAPI app
app = FastAPI(title="BloodBridge API", version="1.0.0")

# SECURITY: Configure CORS (Cross-Origin Resource Sharing)
# This allows our two separate React frontends to talk to this one Backend
origins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files (Uploads)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Registering API Routes from the 'routes' folder
app.include_router(auth.router, prefix="/api")        # Authentication (Login/Register)
app.include_router(hospitals.router, prefix="/api")   # Hospital management
app.include_router(blood_stock.router, prefix="/api") # Inventory management
app.include_router(ai.router, prefix="/api")          # AI/ML Smart Features
app.include_router(utils.router, prefix="/api")       # Utility Helpers
app.include_router(search.router, prefix="/api")      # Blood Search (donors + hospitals)
app.include_router(users.router, prefix="/api")       # User profiles and stats

@app.get("/")
def read_root():
    """Simple welcome route"""
    return {"message": "Welcome to BloodBridge API"}

@app.get("/api/health")
async def health_check():
    """Checks if the Database and API are actually running correctly"""
    try:
        # Pings MongoDB to verify connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}
