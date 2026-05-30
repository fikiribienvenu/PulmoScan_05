"""
Fix old prediction records that are missing subtype_prediction field.
These are from the old binary YES/NO system before the v2 multi-class upgrade.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def fix():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["pulmoscan_db"]

    # Find all records missing subtype_prediction
    query = {"subtype_prediction": {"$exists": False}}
    total = await db["predictions"].count_documents(query)
    print(f"Found {total} records missing subtype_prediction")

    if total == 0:
        print("Nothing to fix.")
        return

    # Patch them: set defaults so the frontend can render them
    result = await db["predictions"].update_many(
        query,
        {"$set": {
            "subtype_prediction":  "Unknown (legacy)",
            "risk_level":          "Moderate",
            "confidence_score":    0.0,
            "class_probabilities": {},
            "model_used":          "Legacy model (pre-v2)",
            "recommendations":     ["This record was created with an older version of PulmoScan AI. Please re-run the prediction for a full subtype analysis."],
        }}
    )
    print(f"Patched {result.modified_count} records")

    # Verify
    remaining = await db["predictions"].count_documents(query)
    print(f"Remaining without subtype_prediction: {remaining}")
    print("Done — refresh the Records page")

asyncio.run(fix())
