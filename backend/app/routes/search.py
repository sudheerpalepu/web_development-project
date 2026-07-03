from fastapi import APIRouter, Depends, HTTPException

from app.database import jobs_collection
from app.services.job_api_service import fetch_jobs
from app.services.prediction_service import calculate_prediction
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/search",
    tags=["Career Search"]
)


@router.get("/{domain}")
async def search_career(
    domain: str,
    current_user: dict = Depends(get_current_user)
):
    jobs = []

    async for job in jobs_collection.find({"domain": domain}):
        job["_id"] = str(job["_id"])
        jobs.append(job)

    if len(jobs) == 0:
        data = fetch_jobs(domain)

        if data is None or "results" not in data:
            raise HTTPException(
                status_code=400,
                detail="Unable to fetch jobs for this domain"
            )

        new_jobs = []

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

            new_jobs.append(document)

        if new_jobs:
            result = await jobs_collection.insert_many(new_jobs)

            for index, job in enumerate(new_jobs):
                job["_id"] = str(result.inserted_ids[index])

            jobs = new_jobs

    salaries = []

    for job in jobs:
        salary_min = job.get("salary_min")
        salary_max = job.get("salary_max")

        try:
            if salary_min is not None and salary_max is not None:
                salaries.append((float(salary_min) + float(salary_max)) / 2)
        except:
            pass

    average_salary = round(sum(salaries) / len(salaries), 2) if salaries else 0

    prediction = calculate_prediction(len(jobs), average_salary)

    return {
        "domain": domain,
        "total_jobs": len(jobs),
        "average_salary": average_salary,
        "career_score": prediction["career_score"],
        "future_scope": prediction["future_scope"],
        "recommendation": f"{domain} is a {prediction['future_scope']} career option based on job demand and salary range.",
        "jobs": jobs,
        "user": current_user["email"]
    }