from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from database import users_collection
from schemas import UserCreate, UserUpdate, UserResponse, LoginRequest, Token, GoogleLoginRequest
from auth_utils import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from datetime import datetime
import uuid
import os
import shutil
import traceback
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])
GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "1070831830390-977ri8uqh5kd7uuo8ijhug3ka1ejqolp.apps.googleusercontent.com"
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

@router.get("/me", response_model=dict)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Returns the currently logged-in user's profile"""
    user_data = dict(current_user)
    if "_id" in user_data:
        user_data["_id"] = str(user_data["_id"])
    return user_data

@router.put("/me", response_model=dict)
async def update_me(profile: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Updates the currently logged-in user's profile info"""
    update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
    
    if update_data:
        await users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
        
    updated_user = await users_collection.find_one({"_id": current_user["_id"]})
    if updated_user:
        updated_user["_id"] = str(updated_user["_id"])
    return updated_user

@router.post("/upload-pfp", response_model=dict)
async def upload_pfp(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Handles profile picture uploads to local storage"""
    file_extension = file.filename.split(".")[-1]
    filename = f"{current_user['_id']}.{file_extension}"
    
    os.makedirs("static/uploads", exist_ok=True)
    file_path = f"static/uploads/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    pfp_url = f"/static/uploads/{filename}"
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"profile_pic": pfp_url}}
    )
    
    return {"status": "success", "profile_pic": pfp_url}

@router.post("/register", response_model=dict)
async def register(profile: UserCreate):
    """Handles new user sign-ups with email and password"""
    existing_user = await users_collection.find_one({"email": profile.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(profile.password)
    user_dict = profile.model_dump()
    user_dict.pop("password")
    user_dict["hashed_password"] = hashed_password
    user_dict["_id"] = str(uuid.uuid4())
    user_dict["created_at"] = datetime.utcnow()
    user_dict["total_donations"] = 0
    
    await users_collection.insert_one(user_dict)
    
    access_token = create_access_token(
        data={"sub": user_dict["email"], "user_type": user_dict["user_type"]}
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user_dict}

@router.post("/login", response_model=dict)
async def login(credentials: LoginRequest):
    """Standard Login with Email and Password"""
    user = await users_collection.find_one({"email": credentials.email})
    
    if not user or not user.get("hashed_password"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user["_id"] = str(user["_id"])
    access_token = create_access_token(
        data={"sub": user["email"], "user_type": user["user_type"]}
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/google", response_model=dict)
async def google_login(req: GoogleLoginRequest):
    """Handles Google OAuth Token verification and user sync"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Client ID not configured on server"
        )
    
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        idinfo = id_token.verify_oauth2_token(
            req.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=60
        )
        
        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Could not get email from Google token")
        
        name = idinfo.get("name", email.split("@")[0])
        profile_pic = idinfo.get("picture", None)
        
        user = await users_collection.find_one({"email": email})
        
        if not user:
            new_user = {
                "_id": str(uuid.uuid4()),
                "email": email,
                "name": name,
                "phone": "",
                "location": "",
                "user_type": "both",
                "blood_group": "",
                "created_at": datetime.utcnow(),
                "total_donations": 0,
                "is_google_user": True,
                "profile_pic": profile_pic,
            }
            await users_collection.insert_one(new_user)
            user = new_user
        else:
            user["_id"] = str(user["_id"])
        
        access_token = create_access_token(
            data={"sub": user["email"], "user_type": user["user_type"]}
        )
        return {"access_token": access_token, "token_type": "bearer", "user": user}
        
    except HTTPException:
        raise
    except ValueError as e:
        error_detail = str(e)
        print(f"Google token verification failed: {error_detail}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Google token: {error_detail}"
        )
    except Exception as e:
        error_msg = f"Google auth error: {str(e)}"
        print(error_msg)
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
