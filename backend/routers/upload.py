"""
Upload Router: Handles forensic evidence bitstream ingestion and hashing.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import CaseModel, RecorderModel

router = APIRouter(prefix="/api/cases/{case_id}/upload", tags=["upload"])


@router.post("")
async def upload_evidence(
    case_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    content = await file.read()
    import hashlib
    file_hash = hashlib.sha256(content).hexdigest()

    rec = RecorderModel(
        id=f"REC-{file.filename[:8].upper()}",
        case_id=case.id,
        brand="AutoDetected",
        adapter_used="Generic Video Carver",
        image_path=f"uploads/{file.filename}",
        image_hash=file_hash,
        file_size_bytes=len(content),
    )
    db.add(rec)
    db.commit()

    return {
        "status": "success",
        "filename": file.filename,
        "size_bytes": len(content),
        "sha256": file_hash,
        "recorder_id": rec.id,
    }
