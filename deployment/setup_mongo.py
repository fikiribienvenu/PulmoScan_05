"""
PulmoScan AI – MongoDB Index Setup Script
Run once after first launch to create optimal indexes.

Usage:
    python deployment/setup_mongo.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient


MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "pulmoscan_db"


async def setup_indexes():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    # ── doctors collection ────────────────────────────────────────────────────
    await db.doctors.create_index("email", unique=True)
    print("✅ Index: doctors.email (unique)")

    # ── predictions collection ────────────────────────────────────────────────
    await db.predictions.create_index("doctor_email")
    await db.predictions.create_index("patient_name")
    await db.predictions.create_index("prediction")
    await db.predictions.create_index([("created_at", -1)])
    await db.predictions.create_index(
        [("doctor_email", 1), ("created_at", -1)]
    )
    print("✅ Indexes: predictions collection")

    # ── batch_uploads collection ──────────────────────────────────────────────
    await db.batch_uploads.create_index("doctor_email")
    await db.batch_uploads.create_index([("created_at", -1)])
    print("✅ Indexes: batch_uploads collection")

    print("\n🎉 MongoDB setup complete. Collections and indexes ready.")
    client.close()


if __name__ == "__main__":
    asyncio.run(setup_indexes())
