from fastapi import APIRouter, Depends

from app.database import users_collection, favorites_collection, jobs_collection
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
async def get_dashboard(
    current_user: dict = Depends(get_current_user)
):
    user = await users_collection.find_one({
        "email": current_user["email"]
    })

    saved_careers = await favorites_collection.count_documents({
        "user_email": current_user["email"],
        "type": "career"
    })

    saved_jobs = await favorites_collection.count_documents({
        "user_email": current_user["email"],
        "type": "job"
    })

    total_jobs = await jobs_collection.count_documents({})

    return {
        "user": {
            "name": user.get("name") if user else "",
            "email": current_user["email"],
            "role": current_user["role"]
        },
        "saved_careers": saved_careers,
        "saved_jobs": saved_jobs,
        "total_jobs_in_database": total_jobs,
        "message": "Dashboard loaded successfully"
    }