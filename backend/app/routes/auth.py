import re

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.database import users_collection
from app.schemas.user_schema import UserRegister
from app.utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def find_user_by_email(email: str):
    normalized_email = email.strip().lower()
    existing_user = await users_collection.find_one({"email": normalized_email})

    if existing_user:
        return existing_user

    return await users_collection.find_one(
        {"email": {"$regex": f"^{re.escape(normalized_email)}$", "$options": "i"}}
    )


@router.post("/register")
async def register_user(user: UserRegister):
    email = user.email.strip().lower()
    name = user.name.strip()
    role = user.role if user.role in {"user", "admin"} else "user"

    existing_user = await find_user_by_email(email)

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = {
        "name": name,
        "email": email,
        "password": hash_password(user.password),
        "role": role
    }

    result = await users_collection.insert_one(user_data)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
        "role": role
    }


@router.post("/login")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    existing_user = await find_user_by_email(form_data.username)

    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(form_data.password, existing_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        data={
            "sub": existing_user["email"],
            "name": existing_user["name"],
            "role": existing_user.get("role", "user")
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }
