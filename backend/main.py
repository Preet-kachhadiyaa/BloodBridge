# Main entry point for the BloodBridge FastAPI Backend
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import db
from routes import auth, hospitals, blood_stock, ai, utils, search, users

# Initialize FastAPI app
app = FastAPI(title="BloodBridge API", version="1.0.0")

# SECURITY: Configure CORS (Cross-Origin Resource Sharing)
# This allows our two separate React frontends to talk to this one Backend
cors_origins_env = os.getenv("CORS_ORIGINS", "").strip()
if cors_origins_env:
    # Comma-separated list of allowed origins, for example:
    # https://your-app.vercel.app,https://another-domain.com
    origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
else:
    origins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost"]

allow_credentials_env = os.getenv("CORS_ALLOW_CREDENTIALS", "true").strip().lower()
allow_credentials = allow_credentials_env in ("1", "true", "yes", "on")
if "*" in origins:
    # Browsers disallow credentialed requests with Access-Control-Allow-Origin: *
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
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
