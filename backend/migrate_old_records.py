"""
Migrate old-format records (ALL_CAPS fields from binary system)
to new v2 schema format so the Records page can display them.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

GENDER_MAP  = {"M": "Male",  "F": "Female", "1": "Male", "2": "Female"}
SMOKING_MAP = {1: "Never",  2: "Current", 0: "Never"}

async def migrate():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["pulmoscan_db"]

    # Old records have ALL-CAPS fields like AGE, GENDER, SMOKING, etc.
    old_query = {"AGE": {"$exists": True}}
    total = await db["predictions"].count_documents(old_query)
    print(f"Found {total} old-format records to migrate")

    if total == 0:
        print("Nothing to migrate.")
        return

    migrated = 0
    async for doc in db["predictions"].find(old_query):
        doc_id = doc["_id"]

        age_raw = doc.get("AGE", 50)
        try:
            age = int(float(age_raw)) if age_raw is not None and str(age_raw) != "nan" else 50
        except (ValueError, TypeError):
            age = 50
        gender = GENDER_MAP.get(str(doc.get("GENDER", "M")), "Male")
        smoke  = SMOKING_MAP.get(doc.get("SMOKING", 1), "Never")

        # Fields to set (new names)
        set_fields = {
            "patient_age":     age,
            "patient_gender":  gender,
            "smoking_history": smoke,
            "family_history":  0,
            "nodule_size_mm":  8.0,
            "tumor_location":  "Right Lung",
            "tumor_stage":     "Stage II",
            "EGFR_mutation_status":  0,
            "KRAS_mutation_status":  0,
            "ALK_fusion_status":     0,
            "PD_L1_expression_level": 10.0,
            "tumor_mutational_burden": 5.0,
        }

        # Fields to remove (old ALL-CAPS names)
        unset_fields = {
            "AGE": "", "GENDER": "", "SMOKING": "",
            "YELLOW_FINGERS": "", "ANXIETY": "", "PEER_PRESSURE": "",
            "CHRONIC_DISEASE": "", "FATIGUE": "", "ALLERGY": "",
            "WHEEZING": "", "ALCOHOL_CONSUMING": "", "COUGHING": "",
            "SHORTNESS_OF_BREATH": "", "SWALLOWING_DIFFICULTY": "",
            "CHEST_PAIN": "", "prediction": "", "risk_probability": "",
            "subtype": "", "subtype_note": "",
        }

        await db["predictions"].update_one(
            {"_id": doc_id},
            {"$set": set_fields, "$unset": unset_fields}
        )
        migrated += 1

    print(f"Migrated {migrated} records")

    # Verify
    remaining = await db["predictions"].count_documents(old_query)
    print(f"Remaining old-format records: {remaining}")
    print("Done — refresh the Records page now")

asyncio.run(migrate())
