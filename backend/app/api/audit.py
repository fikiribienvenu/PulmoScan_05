"""
PulmoScan AI v2 – Audit Log Routes
GET /audit-logs  – paginated activity log for the authenticated doctor
"""
from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_doctor
from app.core.database import get_collection

router = APIRouter(tags=["Audit"])


@router.get("/audit-logs")
async def get_audit_logs(
    page:           int  = Query(1, ge=1),
    limit:          int  = Query(30, ge=1, le=100),
    current_doctor: dict = Depends(get_current_doctor),
):
    """Return paginated audit log entries for the authenticated doctor."""
    col    = get_collection("audit_logs")
    query  = {"doctor_email": current_doctor["email"]}
    total  = await col.count_documents(query)
    cursor = (
        col.find(query)
        .sort("created_at", -1)
        .skip((page - 1) * limit)
        .limit(limit)
    )
    entries = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        doc["created_at"] = str(doc.get("created_at", ""))
        entries.append(doc)

    return {"total": total, "page": page, "limit": limit, "entries": entries}
