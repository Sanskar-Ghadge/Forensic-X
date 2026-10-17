"""
Gaps Router: Evidence gap diagnoses and investigator notes.
"""

import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import GapModel, CameraModel, RecorderModel
from backend.schemas import GapResponse

router = APIRouter(prefix="/api/cases/{case_id}/gaps", tags=["gaps"])


class GapUpdate(BaseModel):
    verdict: str
    investigator_notes: str


@router.get("", response_model=List[GapResponse])
def list_gaps(case_id: str, db: Session = Depends(get_db)):
    gaps = (
        db.query(GapModel)
        .join(GapModel.camera)
        .join(CameraModel.recorder)
        .filter(RecorderModel.case_id == case_id)
        .all()
    )
    results = []
    for g in gaps:
        ev_for = json.loads(g.evidence_for) if g.evidence_for else []
        ev_against = json.loads(g.evidence_against) if g.evidence_against else []
        results.append(
            GapResponse(
                id=g.id,
                camera_id=g.camera_id,
                channel=g.camera.channel,
                start_iso=g.start_iso,
                end_iso=g.end_iso,
                duration_s=g.duration_s,
                verdict=g.verdict,
                confidence=g.confidence,
                evidence_for=ev_for,
                evidence_against=ev_against,
            )
        )
    return results


@router.put("/{gap_id}", response_model=GapResponse)
def update_gap(case_id: str, gap_id: str, update: GapUpdate, db: Session = Depends(get_db)):
    gap = db.query(GapModel).filter(GapModel.id == gap_id).first()
    if not gap:
        raise HTTPException(status_code=404, detail="Gap record not found")

    gap.verdict = update.verdict
    db.commit()
    db.refresh(gap)

    ev_for = json.loads(gap.evidence_for) if gap.evidence_for else []
    ev_against = json.loads(gap.evidence_against) if gap.evidence_against else []

    return GapResponse(
        id=gap.id,
        camera_id=gap.camera_id,
        channel=gap.camera.channel,
        start_iso=gap.start_iso,
        end_iso=gap.end_iso,
        duration_s=gap.duration_s,
        verdict=gap.verdict,
        confidence=gap.confidence,
        evidence_for=ev_for,
        evidence_against=ev_against,
    )
