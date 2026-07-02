from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URI, DATABASE_NAME

client = AsyncIOMotorClient(MONGO_URI)
database = client[DATABASE_NAME]

career_domains_collection = database["career_domains"]
jobs_collection = database["jobs"]
users_collection = database["users"]
users_collection = database["users"]
favorites_collection = database["favorites"]