from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
import re

# Pydantic Schemas - Validates data coming into and out of the API

class UserBase(BaseModel):
    """Shared fields for all user types"""
    email: EmailStr
    # Name must be alphabetic and at least 2 characters
    name: str = Field(..., min_length=2, pattern=r"^[a-zA-Z\s]+$")
    # Phone must be exactly 10 digits if provided
    phone: Optional[str] = Field(None, pattern=r"^(\d{10})?$")
    location: Optional[str] = None
    blood_group: Optional[str] = None
    profile_pic: Optional[str] = None
    # User type must be one of the pre-defined roles
    user_type: str = Field(..., pattern=r"^(blood_donor|blood_finder|both|admin)$")

class UserCreate(UserBase):
    """Schema for new user registration"""
    password: str = Field(..., min_length=8)

    @field_validator('password')
    @classmethod
    def password_validation(cls, v: str) -> str:
        # Custom logic: Requires at least one letter and one number
        if not re.search(r'[a-zA-Z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

class UserUpdate(BaseModel):
    """Schema for updating an existing user profile"""
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    blood_group: Optional[str] = None
    health_status: Optional[str] = None
    profile_pic: Optional[str] = None

class UserResponse(UserBase):
    """Schema for sending user data back to the frontend (excludes password)"""
    id: str = Field(alias="_id")
    created_at: datetime
    total_donations: int = 0

    class Config:
        populate_by_name = True

class HospitalBase(BaseModel):
    """Shared fields for hospitals"""
    name: str = Field(..., min_length=2, pattern=r"^[a-zA-Z0-9\s,\.]+$")
    email: EmailStr
    phone: str = Field(..., pattern=r"^\d{10}$")
    location: str = Field(..., min_length=2)
    units: Optional[int] = 0


class HospitalCreate(HospitalBase):
    """Schema for adding new hospitals to the platform"""
    pass

class StockUpdate(BaseModel):
    """Schema for updating blood inventory units"""
    hospital_id: str
    blood_group: str = Field(..., pattern=r"^(A\+|A-|B\+|B-|AB\+|AB-|O\+|O-)$")
    component: str = Field(..., pattern=r"^(Whole Blood|Plasma|Platelets|Red Cells)$")
    units: int = Field(..., ge=0) # Must be 0 or more

class AppointmentCreate(BaseModel):
    """Schema for booking a blood donation appointment"""
    hospital_id: str
    blood_group: str
    weight: str
    health_status: str
    last_donation_date: Optional[str] = None
    date: str
    time: str
    donation_type: str

class Token(BaseModel):
    """Schema for the JWT Auth token"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Data stored inside the JWT token"""
    email: Optional[str] = None
    user_type: Optional[str] = None

class LoginRequest(BaseModel):
    """Data required for standard email/password login"""
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    """Data required for Google OAuth login"""
    credential: str

class BloodRequestCreate(BaseModel):
    """Schema for creating a new blood request"""
    blood_group: str = Field(..., pattern=r"^(A\+|A-|B\+|B-|AB\+|AB-|O\+|O-)$")
    units: int = Field(..., ge=1)
    hospital_name: str
    patient_name: str
    reason: str
    contact_phone: str
    urgency: str = Field(..., pattern=r"^(Normal|Urgent|Critical)$")
