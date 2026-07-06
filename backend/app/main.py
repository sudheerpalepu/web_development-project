from fastapi import FastAPI

from app.config import CORS_ORIGINS
from app.database import database
from app.routes.auth import router as auth_router
from app.routes.careers import router as careers_router
from app.routes.jobs import router as jobs_router
from app.routes.analytics import router as analytics_router
from app.routes.predictions import router as predictions_router
from app.routes.dashboard import router as dashboard_router
from app.routes.favorites import router as favorites_router
from app.routes.search import router as search_router
from app.routes.profile import router as profile_router
from app.routes.resume import router as resume_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Career Guide Dashboard API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(search_router)
app.include_router(dashboard_router)
app.include_router(favorites_router)
app.include_router(auth_router)
app.include_router(careers_router)
app.include_router(jobs_router)
app.include_router(analytics_router)
app.include_router(predictions_router)


@app.get("/")
async def home():
    return {
        "message": "Career Guide Dashboard API"
    }


@app.get("/test-db")
async def test_database():
    collections = await database.list_collection_names()

    return {
        "status": "Connected",
        "collections": collections
    }
