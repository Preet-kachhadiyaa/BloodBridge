import os
from urllib.parse import quote_plus
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "bloodbridge")

def normalize_mongo_uri(uri: str) -> str:
    """
    If MONGO_URI contains credentials with special characters (e.g. ':' '@' etc.),
    pymongo may fail with InvalidURI unless username/password are RFC3986 escaped.
    """
    if not uri:
        return uri
    if "mongodb://" not in uri and "mongodb+srv://" not in uri:
        return uri
    if "@" not in uri or "://" not in uri:
        return uri

    try:
        scheme, rest = uri.split("://", 1)
        scheme = f"{scheme}://"

        # Use the last '@' to split credentials from host,
        # so usernames/passwords containing '@' (if any) are handled better.
        userinfo, host = rest.rsplit("@", 1)
        if ":" not in userinfo:
            return uri

        username, password = userinfo.split(":", 1)

        # If password already contains percent-encoding, don't double-encode.
        if "%" in password:
            return uri

        username_enc = quote_plus(username)
        password_enc = quote_plus(password)
        return f"{scheme}{username_enc}:{password_enc}@{host}"
    except Exception:
        # If parsing fails, return as-is and let pymongo raise a clearer error.
        return uri

MONGO_URI = normalize_mongo_uri(MONGO_URI)

try:
    client = AsyncIOMotorClient(MONGO_URI)
except Exception as e:
    raise RuntimeError(f"Invalid MONGO_URI. {e}") from e

db = client[DB_NAME]

# Collections
users_collection = db.get_collection("users")
hospitals_collection = db.get_collection("hospitals")
blood_stock_collection = db.get_collection("blood_stock")
requests_collection = db.get_collection("blood_requests")
donations_collection = None
appointments_collection = None
