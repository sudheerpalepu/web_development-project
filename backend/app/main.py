from fastapi import FastAPI
from app.database import database

app = FastAPI()

@app.get("/")
async def home():
    return {"message": "Career Guide Dashboard API"}

@app.get("/test-db")
async def test_db():
    collections = await database.list_collection_names()

    return {
        "status": "Connected",
        "collections": collections
    }