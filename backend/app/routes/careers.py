from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.database import career_domains_collection
from app.schemas.career_schema import CareerDomain

router = APIRouter(
    prefix="/careers",
    tags=["Career Domains"]
)


def career_serializer(career) -> dict:
    return {
        "id": str(career["_id"]),
        "domain_name": career["domain_name"],
        "job_count": career["job_count"],
        "average_salary": career["average_salary"],
        "salary_min": career["salary_min"],
        "salary_max": career["salary_max"],
        "growth_score": career["growth_score"],
        "future_scope": career["future_scope"]
    }


@router.post("/")
async def create_career_domain(career: CareerDomain):
    result = await career_domains_collection.insert_one(career.dict())

    return {
        "message": "Career domain added successfully",
        "id": str(result.inserted_id)
    }


@router.get("/")
async def get_all_career_domains():
    careers = []

    async for career in career_domains_collection.find():
        careers.append(career_serializer(career))

    return careers


@router.get("/{career_id}")
async def get_career_domain(career_id: str):
    if not ObjectId.is_valid(career_id):
        raise HTTPException(status_code=400, detail="Invalid career ID")

    career = await career_domains_collection.find_one({
        "_id": ObjectId(career_id)
    })

    if not career:
        raise HTTPException(status_code=404, detail="Career domain not found")

    return career_serializer(career)


@router.delete("/{career_id}")
async def delete_career_domain(career_id: str):
    if not ObjectId.is_valid(career_id):
        raise HTTPException(status_code=400, detail="Invalid career ID")

    result = await career_domains_collection.delete_one({
        "_id": ObjectId(career_id)
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Career domain not found")

    return {
        "message": "Career domain deleted successfully"
    }