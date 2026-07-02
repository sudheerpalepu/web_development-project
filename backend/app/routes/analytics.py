from fastapi import APIRouter, HTTPException
from collections import Counter

from app.database import jobs_collection

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/{domain}")
async def get_career_analytics(domain: str):
    jobs = []

    async for job in jobs_collection.find({"domain": domain}):
        job["_id"] = str(job["_id"])
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

        if isinstance(salary_min, (int, float)) and isinstance(salary_max, (int, float)):
            average_job_salary = (salary_min + salary_max) / 2
            salaries.append(average_job_salary)

    if salaries:
        average_salary = round(sum(salaries) / len(salaries), 2)
        highest_salary = round(max(salaries), 2)
        lowest_salary = round(min(salaries), 2)
    else:
        average_salary = 0
        highest_salary = 0
        lowest_salary = 0

    companies = [
        job.get("company")
        for job in jobs
        if job.get("company")
    ]

    top_companies = Counter(companies).most_common(5)

    total_jobs = len(jobs)

    job_score = min(total_jobs * 2, 40)

    if average_salary >= 100000:
        salary_score = 40
    elif average_salary >= 80000:
        salary_score = 35
    elif average_salary >= 60000:
        salary_score = 30
    elif average_salary >= 40000:
        salary_score = 20
    else:
        salary_score = 10

    demand_score = 20 if total_jobs >= 20 else 10

    career_score = job_score + salary_score + demand_score

    if career_score >= 90:
        future_scope = "Excellent"
    elif career_score >= 75:
        future_scope = "Very High"
    elif career_score >= 60:
        future_scope = "High"
    elif career_score >= 45:
        future_scope = "Moderate"
    else:
        future_scope = "Low"

    return {
        "domain": domain,
        "total_jobs": total_jobs,
        "average_salary": average_salary,
        "highest_salary": highest_salary,
        "lowest_salary": lowest_salary,
        "top_companies": [
            {
                "company": company,
                "job_count": count
            }
            for company, count in top_companies
        ],
        "career_score": career_score,
        "future_scope": future_scope,
        "recommendation": f"{domain} has {future_scope} future career scope."
    }