import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["pulmoscan_db"]

    await db["doctors"].delete_many({"email": "admin@pulmoscan.ai"})

    doc = {
        "full_name": "Dr. Admin",
        "email": "admin@pulmoscan.ai",
        "hashed_password": pwd.hash("Admin1234"),
        "specialty": "Oncology",
        "hospital": "CHUB",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db["doctors"].insert_one(doc)
    found = await db["doctors"].find_one({"email": "admin@pulmoscan.ai"})
    ok = pwd.verify("Admin1234", found["hashed_password"])
    print("Doctor inserted:", result.inserted_id)
    print("full_name field:", found["full_name"])
    print("Password verify:", ok)
    print()
    print("Login credentials:")
    print("  Email:    admin@pulmoscan.ai")
    print("  Password: Admin1234")

asyncio.run(seed())
