from fastapi import APIRouter, HTTPException, Depends

from app.services.job_api_service import fetch_jobs
from app.database import jobs_collection
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


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
            "salary_min": job.get("salary_min"),
            "salary_max": job.get("salary_max"),
            "redirect_url": job.get("redirect_url"),
            "source": "Adzuna"
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


@router.get("/")
async def get_saved_jobs(
    current_user: dict = Depends(get_current_user)
):
    jobs = []

    async for job in jobs_collection.find():
        job["_id"] = str(job["_id"])
        jobs.append(job)

    return {
        "total_jobs": len(jobs),
        "jobs": jobs,
        "user": current_user["email"]
    }