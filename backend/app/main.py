from fastapi import FastAPI

from app.database import database
from app.routes.auth import router as auth_router
from app.routes.careers import router as careers_router
from app.routes.jobs import router as jobs_router
from app.routes.analytics import router as analytics_router
from app.routes.predictions import router as predictions_router

app = FastAPI(
    title="Career Guide Dashboard API",
    version="1.0.0"
)

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