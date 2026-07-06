from fastapi import APIRouter, Depends, HTTPException
from app.database import jobs_collection, users_collection
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get("/")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_email = current_user["email"]
    user = await users_collection.find_one({"email": user_email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    applied_jobs = []

    async for job in jobs_collection.find({"applied_users": user_email}):
        job["_id"] = str(job["_id"])
        job["applied_count"] = len(job.get("applied_users", []))
        job.pop("applied_users", None)
        applied_jobs.append(job)

    return {
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "user"),
        "resume_profile": user.get("resume_profile"),
        "applied_jobs": applied_jobs,
        "applied_jobs_count": len(applied_jobs),
    }


@router.put("/")
async def update_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user)
):
    name = profile_data.get("name")

    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"name": name}}
    )

    return {
        "message": "Profile updated successfully",
        "name": name,
        "email": current_user["email"]
    }
