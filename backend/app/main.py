from fastapi import FastAPI

from app.database import database
from app.routes.careers import router as careers_router

app = FastAPI(
    title="Career Guide Dashboard API",
    version="1.0.0"
)

app.include_router(careers_router)


@app.get("/")
async def home():
    return {
        "message": "Career Guide Dashboard API"
    }


@app.get("/test-db")
async def test_db():
    collections = await database.list_collection_names()

    return {
        "status": "Connected",
        "collections": collections
    }