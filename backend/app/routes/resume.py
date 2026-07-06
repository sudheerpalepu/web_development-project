from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from datetime import datetime, timezone
import re

from app.database import jobs_collection, users_collection
from app.services.resume_service import (
    aliases_for_domain,
    analyze_resume_text,
    extract_resume_text,
)
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


@router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    allowed_extensions = (".pdf", ".txt", ".docx")

    if not resume.filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF, DOCX, or TXT resume."
        )

    content = await resume.read()

    if not content:
        raise HTTPException(status_code=400, detail="Uploaded resume is empty.")

    text = extract_resume_text(resume.filename, content)
    analysis = analyze_resume_text(text)

    for recommendation in analysis["recommendations"]:
        jobs = []
        domain_aliases = aliases_for_domain(recommendation["domain"])
        domain_filters = [
            {"domain": {"$regex": f"^{re.escape(alias)}$", "$options": "i"}}
            for alias in domain_aliases
        ]

        async for job in jobs_collection.find(
            {"$or": domain_filters}
        ).limit(3):
            job["_id"] = str(job["_id"])
            job.pop("applied_users", None)
            jobs.append(job)

        recommendation["jobs"] = jobs

    resume_profile = {
        "filename": resume.filename,
        "summary": analysis["summary"],
        "matched_skills": analysis["matched_skills"],
        "recommendations": [
            {
                "domain": recommendation["domain"],
                "match_score": recommendation["match_score"],
                "matched_skills": recommendation["matched_skills"],
                "skills_to_learn": recommendation["skills_to_learn"],
                "reason": recommendation["reason"],
            }
            for recommendation in analysis["recommendations"]
        ],
        "uploaded_at": datetime.now(timezone.utc),
    }

    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"resume_profile": resume_profile}},
    )

    return {
        **analysis,
        "filename": resume.filename,
        "user": current_user["email"],
    }
