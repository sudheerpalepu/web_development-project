from fastapi import APIRouter, Depends, HTTPException

from app.database import jobs_collection
from app.services.job_api_service import fetch_jobs
from app.services.prediction_service import calculate_prediction
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/search",
    tags=["Career Search"]
)

RELATED_ROLE_QUERIES = {
    "data science": [
        "Data Science",
        "Data Scientist",
        "Data Analyst",
        "Data Engineer",
        "Machine Learning Engineer",
        "Business Intelligence Analyst",
    ],
    "cloud": [
        "Cloud",
        "Cloud Engineer",
        "DevOps Engineer",
        "AWS Engineer",
        "Azure Engineer",
        "Cloud Architect",
    ],
    "cyber security": [
        "Cyber Security",
        "Cybersecurity Analyst",
        "Security Engineer",
        "Information Security Analyst",
        "SOC Analyst",
        "Penetration Tester",
    ],
    "cybersecurity": [
        "Cybersecurity",
        "Cybersecurity Analyst",
        "Security Engineer",
        "Information Security Analyst",
        "SOC Analyst",
        "Penetration Tester",
    ],
    "ai": [
        "AI",
        "AI Engineer",
        "Machine Learning Engineer",
        "NLP Engineer",
        "Computer Vision Engineer",
        "MLOps Engineer",
    ],
    "artificial intelligence": [
        "Artificial Intelligence",
        "AI Engineer",
        "Machine Learning Engineer",
        "NLP Engineer",
        "Computer Vision Engineer",
        "MLOps Engineer",
    ],
}


def role_queries_for_domain(domain: str) -> list[str]:
    normalized_domain = domain.strip().lower()
    return RELATED_ROLE_QUERIES.get(normalized_domain, [domain])


@router.get("/{domain}")
async def search_career(
    domain: str,
    current_user: dict = Depends(get_current_user)
):
    jobs = []

    async for job in jobs_collection.find({"domain": domain}):
        job["_id"] = str(job["_id"])
        jobs.append(job)

    existing_queries = {
        job.get("search_query") or job.get("domain")
        for job in jobs
    }
    queries_to_fetch = [
        query
        for query in role_queries_for_domain(domain)
        if query not in existing_queries
    ]

    for query in queries_to_fetch:
        data = fetch_jobs(query)

        if data is None or "results" not in data:
            if len(jobs) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="Unable to fetch jobs for this domain"
                )
            continue

        new_jobs = []

        for job in data.get("results", []):
            document = {
                "domain": domain,
                "search_query": query,
                "title": job.get("title"),
                "company": job.get("company", {}).get("display_name"),
                "location": job.get("location", {}).get("display_name"),
                "description": job.get("description"),
                "salary_min": job.get("salary_min"),
                "salary_max": job.get("salary_max"),
                "contract_time": job.get("contract_time"),
                "contract_type": job.get("contract_type"),
                "category": job.get("category", {}).get("label"),
                "created": job.get("created"),
                "redirect_url": job.get("redirect_url"),
                "latitude": job.get("latitude"),
                "longitude": job.get("longitude"),
                "source": "Adzuna"
            }

            new_jobs.append(document)

        if new_jobs:
            result = await jobs_collection.insert_many(new_jobs)

            for index, job in enumerate(new_jobs):
                job["_id"] = str(result.inserted_ids[index])

            jobs.extend(new_jobs)

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
