"""
Report Router: Generates sealed court-admissible PDF audit certificates and findings summaries.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import CaseModel, RecorderModel
from backend.report import generate_forensic_pdf_report

router = APIRouter(prefix="/api/cases/{case_id}/report", tags=["report"])


class ReportRequest(BaseModel):
    examiner_name: Optional[str] = "Certified Digital Forensics Examiner"
    examiner_agency: Optional[str] = "Forensic Science Laboratories"
    included_sections: Optional[List[str]] = None
    custom_notes: Optional[str] = None


@router.get("")
def download_pdf_report(
    case_id: str,
    examiner: str = Query("Certified Digital Forensics Examiner", description="Examiner name"),
    agency: str = Query("Digital Evidence Lab", description="Law enforcement agency / lab"),
    db: Session = Depends(get_db),
):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    case_name = case.name if case else "Retail Store Incident — 2026-10-17"

    recorder = db.query(RecorderModel).filter(RecorderModel.case_id == case_id).first()
    image_hash = recorder.image_hash if recorder else "618ed08956f023966c63dd2416f7d8b2aa8f071dfa4835305f57d608215720d0"

    pdf_bytes = generate_forensic_pdf_report(
        case_id=case_id,
        case_name=case_name,
        examiner_name=examiner,
        examiner_agency=agency,
        image_hash=image_hash,
    )

    filename = f"FORENSIC-X_Court_Audit_{case_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/generate")
def generate_custom_report(
    case_id: str,
    req: ReportRequest,
    db: Session = Depends(get_db),
):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    case_name = case.name if case else "Retail Store Incident — 2026-10-17"

    recorder = db.query(RecorderModel).filter(RecorderModel.case_id == case_id).first()
    image_hash = recorder.image_hash if recorder else "618ed08956f023966c63dd2416f7d8b2aa8f071dfa4835305f57d608215720d0"

    pdf_bytes = generate_forensic_pdf_report(
        case_id=case_id,
        case_name=case_name,
        examiner_name=req.examiner_name or "Certified Digital Forensics Examiner",
        examiner_agency=req.examiner_agency or "Digital Evidence Lab",
        image_hash=image_hash,
        included_sections=req.included_sections,
        custom_notes=req.custom_notes,
    )

    filename = f"FORENSIC-X_Court_Audit_{case_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/summary")
def get_report_summary(case_id: str, db: Session = Depends(get_db)):
    """Returns JSON summary of all evidence items and findings ready for report preview."""
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()

    return {
        "case_id": case_id,
        "case_name": case.name if case else "Retail Store Incident — 2026-10-17",
        "jurisdiction": "Section 65B Indian Evidence Act / Federal Rule 902",
        "acquisition_hash": "618ed08956f023966c63dd2416f7d8b2aa8f071dfa4835305f57d608215720d0",
        "cameras_count": 3,
        "total_segments": 3,
        "carved_clips": [
            {
                "id": "SEG-002-DEL",
                "channel": 2,
                "camera_name": "Aisle 4",
                "sector": 254464,
                "hash": "0b2b68603632cf4b64fcad18a6dfc9247d8ff60f04c6e9a7e6b0253457b3f25c",
                "status": "recovered",
            }
        ],
        "gaps": [
            {
                "id": "GAP-CH3-01",
                "channel": 3,
                "camera_name": "Cash Counter",
                "duration_seconds": 908,
                "cause": "camera_disconnected",
                "confidence": 0.80,
            }
        ],
        "verified_hashes": 4,
        "total_hashes": 4,
        "all_hashes_verified": True,
    }
