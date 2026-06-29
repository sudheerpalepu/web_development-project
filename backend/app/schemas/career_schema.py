from pydantic import BaseModel

class CareerDomain(BaseModel):
    domain_name: str
    job_count: int
    average_salary: int
    salary_min: int
    salary_max: int
    growth_score: int
    future_scope: str