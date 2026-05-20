"""
PulmoScan AI – MongoDB Connection
Motor async driver for FastAPI.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None


async def connect_db():
    """Open MongoDB connection on app startup."""
    global client
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    print(f"[OK] Connected to MongoDB at {settings.MONGODB_URL}")


async def close_db():
    """Close MongoDB connection on app shutdown."""
    global client
    if client:
        client.close()
        print("[OK] MongoDB connection closed")


def get_database():
    """Return the main database instance."""
    return client[settings.DB_NAME]


def get_collection(name: str):
    """Return a specific collection by name."""
    return get_database()[name]
