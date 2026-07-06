from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from app.services.job_api_service import fetch_jobs
from app.database import jobs_collection
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


class ManualJob(BaseModel):
    title: str = Field(..., min_length=2)
    company: str = Field(..., min_length=2)
    domain: str = Field(..., min_length=2)
    location: str | None = None
    description: str | None = None
    category: str | None = None
    contract_type: str | None = None
    salary_min: float | None = None
    salary_max: float | None = None
    redirect_url: str | None = None


@router.get("/fetch/{domain}")
async def fetch_jobs_from_api(
    domain: str,
    current_user: dict = Depends(get_current_user)
):
    data = fetch_jobs(domain)

    if data is None:
        raise HTTPException(status_code=400, detail="Unable to fetch jobs")

    if "error" in data:
        raise HTTPException(status_code=400, detail=data)

    if "results" not in data:
        raise HTTPException(status_code=400, detail=data)

    jobs = []

    for job in data.get("results", []):
        document = {
            "domain": domain,
            "title": job.get("title"),
            "company": job.get("company", {}).get("display_name"),
            "location": job.get("location", {}).get("display_name"),
            "description": job.get("description"),
            "category": job.get("category", {}).get("label"),
            "contract_type": job.get("contract_type"),
            "created": job.get("created"),
            "salary_min": job.get("salary_min"),
            "salary_max": job.get("salary_max"),
            "redirect_url": job.get("redirect_url"),
            "source": "Adzuna",
            "applied_users": []
        }

        jobs.append(document)

    if jobs:
        await jobs_collection.insert_many(jobs)

    return {
        "message": "Jobs imported successfully",
        "domain": domain,
        "total_jobs": len(jobs),
        "user": current_user["email"]
    }


@router.post("/")
async def create_manual_job(
    job: ManualJob,
    current_user: dict = Depends(get_current_user)
):
    document = {
        "domain": job.domain.strip(),
        "search_query": job.domain.strip(),
        "title": job.title.strip(),
        "company": job.company.strip(),
        "location": job.location.strip() if job.location else None,
        "description": job.description.strip() if job.description else None,
        "category": job.category.strip() if job.category else None,
        "contract_type": job.contract_type.strip() if job.contract_type else None,
        "created": None,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "redirect_url": job.redirect_url.strip() if job.redirect_url else None,
        "source": "Manual",
        "created_by": current_user["email"],
        "applied_users": [],
    }

    result = await jobs_collection.insert_one(document)
    document["_id"] = str(result.inserted_id)
    document["applied_count"] = 0
    document["has_applied"] = False
    document.pop("applied_users", None)

    return {
        "message": "Job added successfully",
        "job": document,
        "user": current_user["email"],
    }


@router.get("/")
async def get_saved_jobs(
    current_user: dict = Depends(get_current_user)
):
    jobs = []
    user_email = current_user["email"]

    async for job in jobs_collection.find():
        job["_id"] = str(job["_id"])
        applied_users = job.get("applied_users", [])
        job["applied_count"] = len(applied_users)
        job["has_applied"] = user_email in applied_users
        job.pop("applied_users", None)
        jobs.append(job)

    return {
        "total_jobs": len(jobs),
        "jobs": jobs,
        "user": current_user["email"]
    }


@router.patch("/{job_id}/apply")
async def mark_job_as_applied(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        object_id = ObjectId(job_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid job id")

    result = await jobs_collection.update_one(
        {"_id": object_id},
        {"$addToSet": {"applied_users": current_user["email"]}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "message": "Job marked as applied",
        "job_id": job_id,
        "user": current_user["email"]
    }
