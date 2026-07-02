from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.database import favorites_collection
from app.schemas.favorite_schema import FavoriteCareer, FavoriteJob
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)


@router.post("/career")
async def save_favorite_career(
    career: FavoriteCareer,
    current_user: dict = Depends(get_current_user)
):
    data = {
        "user_email": current_user["email"],
        "type": "career",
        "domain": career.domain
    }

    result = await favorites_collection.insert_one(data)

    return {
        "message": "Favorite career saved successfully",
        "id": str(result.inserted_id)
    }


@router.get("/career")
async def get_favorite_careers(
    current_user: dict = Depends(get_current_user)
):
    careers = []

    async for career in favorites_collection.find({
        "user_email": current_user["email"],
        "type": "career"
    }):
        career["_id"] = str(career["_id"])
        careers.append(career)

    return careers


@router.post("/job")
async def save_favorite_job(
    job: FavoriteJob,
    current_user: dict = Depends(get_current_user)
):
    data = {
        "user_email": current_user["email"],
        "type": "job",
        "job_id": job.job_id,
        "title": job.title,
        "company": job.company,
        "location": job.location
    }

    result = await favorites_collection.insert_one(data)

    return {
        "message": "Favorite job saved successfully",
        "id": str(result.inserted_id)
    }


@router.get("/job")
async def get_favorite_jobs(
    current_user: dict = Depends(get_current_user)
):
    jobs = []

    async for job in favorites_collection.find({
        "user_email": current_user["email"],
        "type": "job"
    }):
        job["_id"] = str(job["_id"])
        jobs.append(job)

    return jobs


@router.delete("/{favorite_id}")
async def delete_favorite(
    favorite_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(favorite_id):
        raise HTTPException(status_code=400, detail="Invalid favorite ID")

    result = await favorites_collection.delete_one({
        "_id": ObjectId(favorite_id),
        "user_email": current_user["email"]
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")

    return {
        "message": "Favorite deleted successfully"
    }