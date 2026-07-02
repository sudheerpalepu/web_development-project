from fastapi import APIRouter, HTTPException

from app.services.job_api_service import fetch_jobs
from app.database import jobs_collection

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


@router.get("/fetch/{domain}")
async def fetch_jobs_from_api(domain: str):

    data = fetch_jobs(domain)

    if data is None:
        raise HTTPException(
            status_code=400,
            detail="Unable to fetch jobs"
        )

    jobs = []

    for job in data["results"]:

        document = {
            "domain": domain,
            "title": job.get("title"),
            "company": job.get("company", {}).get("display_name"),
            "location": job.get("location", {}).get("display_name"),
            "salary_min": job.get("salary_min"),
            "salary_max": job.get("salary_max"),
            "redirect_url": job.get("redirect_url")
        }

        jobs.append(document)

    if jobs:
        await jobs_collection.insert_many(jobs)

    return {
        "message": "Jobs imported successfully",
        "total_jobs": len(jobs)
    }


@router.get("/")
async def get_saved_jobs():

    jobs = []

    async for job in jobs_collection.find():

        job["_id"] = str(job["_id"])

        jobs.append(job)

    return jobs