from pydantic import BaseModel


class FavoriteCareer(BaseModel):
    domain: str


class FavoriteJob(BaseModel):
    job_id: str
    title: str
    company: str
    location: str