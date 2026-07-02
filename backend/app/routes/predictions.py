from fastapi import APIRouter, HTTPException
from fastapi import Depends
from app.utils.auth import get_current_user

from app.database import jobs_collection
from app.services.prediction_service import calculate_prediction

router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"]
)


@router.get("/{domain}")
async def predict_career_scope(
    domain: str,
    current_user: dict = Depends(get_current_user)
):
    jobs = []

    async for job in jobs_collection.find({"domain": domain}):
        jobs.append(job)

    if not jobs:
        raise HTTPException(
            status_code=404,
            detail="No jobs found for this domain. Please fetch jobs first."
        )

    salaries = []

    for job in jobs:
        salary_min = job.get("salary_min")
        salary_max = job.get("salary_max")

        try:
            if salary_min is not None and salary_max is not None:
                salary_min = float(salary_min)
                salary_max = float(salary_max)
                salaries.append((salary_min + salary_max) / 2)
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
        "recommendation": f"{domain} is a {prediction['future_scope']} career option based on job demand and salary range."
    }