"""
Cases Router: CRUD operations and case repository access.
"""

import json
import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import (
    CaseModel,
    RecorderModel,
    CameraModel,
    SegmentModel,
    GapModel,
    LogEventModel,
)
from backend.schemas import CaseResponse, CaseCreate

router = APIRouter(prefix="/api/cases", tags=["cases"])


def seed_demo_case_if_needed(db: Session):
    """Seeds the APEX-01 demo case into SQLite from sample_data/truth.json if not present."""
    existing = db.query(CaseModel).filter(CaseModel.id == "CASE-2026-APEX-01").first()
    if existing:
        return

    truth_path = os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "truth.json")
    if not os.path.isfile(truth_path):
        return

    with open(truth_path, "r", encoding="utf-8") as f:
        truth = json.load(f)

    # 1. Create Case
    demo_case = CaseModel(
        id=truth["case_id"],
        name=truth["case_name"],
        incident_time=truth.get("incident_time", "2026-10-17T21:42:17Z"),
        status="ready",
        notes="Suspect movement across Entrance, Aisle 4, and Cash Counter. Includes carved deleted clip and hardware signal loss.",
    )
    db.add(demo_case)

    # 2. Add Recorder
    rec = truth["recorders"][0]
    recorder = RecorderModel(
        id=rec["id"],
        case_id=demo_case.id,
        brand=rec["brand"],
        adapter_used="MockVendorAdapter",
        image_path=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "mock_dvr.img")),
        image_hash=rec["sha256"],
        file_size_bytes=rec["filesize_bytes"],
    )
    db.add(recorder)

    # 3. Add Cameras
    cam_models = {}
    for c in truth["cameras"]:
        cam = CameraModel(
            id=f"CAM-CH{c['channel']}",
            recorder_id=recorder.id,
            channel=c["channel"],
            location_name=c["location"],
            clock_offset_s=c["true_clock_offset_s"],
            offset_error_s=1.0 if c["channel"] == 2 else 0.0,
            status=c["status"],
        )
        db.add(cam)
        cam_models[c["channel"]] = cam

    db.flush()

    # 4. Add Segments
    for s in truth["segments"]:
        cam = cam_models.get(s["channel"])
        if not cam:
            continue
        seg = SegmentModel(
            id=s["id"],
            camera_id=cam.id,
            start_timestamp=s["start_timestamp"],
            start_iso=s["start_iso"],
            corrected_start_iso=s["start_iso"],
            duration_s=s["duration_s"],
            disk_offset=s["disk_offset"],
            length_bytes=s["length_bytes"],
            sha256_hash=s["sha256"],
            status=s["status"],
            method="carved" if not s.get("is_indexed", True) else "index",
        )
        db.add(seg)

    # 5. Add Gaps
    for g in truth.get("gaps", []):
        cam = cam_models.get(g["channel"])
        if not cam:
            continue
        gap = GapModel(
            id=f"GAP-CH{g['channel']}-{g['start_time'][:19]}",
            camera_id=cam.id,
            start_iso=g["start_time"],
            end_iso=g["end_time"],
            duration_s=g["duration_s"],
            verdict=g["true_cause"],
            confidence=g["expected_confidence"],
            evidence_for=json.dumps(g.get("supporting_evidence", [])),
            evidence_against=json.dumps(g.get("contradicting_evidence", [])),
        )
        db.add(gap)

    # 6. Add Log Events from events.log
    log_path = os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "events.log")
    if os.path.isfile(log_path):
        from forensic_core.logs import LogParser
        parser = LogParser()
        events = parser.parse_file(log_path)
        for e in events:
            db.add(
                LogEventModel(
                    case_id=demo_case.id,
                    timestamp=e.timestamp,
                    iso_time=e.iso_time,
                    level=e.level,
                    category=e.category,
                    message=e.message,
                )
            )

    db.commit()


@router.get("", response_model=List[CaseResponse])
def list_cases(db: Session = Depends(get_db)):
    seed_demo_case_if_needed(db)
    cases = db.query(CaseModel).all()
    results = []
    for c in cases:
        rec = db.query(RecorderModel).filter(RecorderModel.case_id == c.id).first()
        cam_count = 0
        if rec:
            cam_count = db.query(CameraModel).filter(CameraModel.recorder_id == rec.id).count()
        results.append(
            CaseResponse(
                id=c.id,
                name=c.name,
                status=c.status,
                incident_time=c.incident_time,
                created_at=c.created_at.isoformat() if c.created_at else "",
                recorder_count=len(c.recorders),
                camera_count=cam_count,
                sha256=rec.image_hash if rec else None,
                notes=c.notes,
            )
        )
    return results


@router.post("", response_model=CaseResponse)
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    existing = db.query(CaseModel).filter(CaseModel.id == case_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Case ID already exists")

    new_case = CaseModel(
        id=case_in.id,
        name=case_in.name,
        incident_time=case_in.incident_time,
        notes=case_in.notes,
        status="new",
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    return CaseResponse(
        id=new_case.id,
        name=new_case.name,
        status=new_case.status,
        incident_time=new_case.incident_time,
        created_at=new_case.created_at.isoformat(),
        recorder_count=0,
        camera_count=0,
        notes=new_case.notes,
    )


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: str, db: Session = Depends(get_db)):
    seed_demo_case_if_needed(db)
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    rec = db.query(RecorderModel).filter(RecorderModel.case_id == case.id).first()
    cam_count = 0
    if rec:
        cam_count = db.query(CameraModel).filter(CameraModel.recorder_id == rec.id).count()

    return CaseResponse(
        id=case.id,
        name=case.name,
        status=case.status,
        incident_time=case.incident_time,
        created_at=case.created_at.isoformat() if case.created_at else "",
        recorder_count=len(case.recorders),
        camera_count=cam_count,
        sha256=rec.image_hash if rec else None,
        notes=case.notes,
    )


@router.delete("/{case_id}")
def delete_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    db.delete(case)
    db.commit()
    return {"status": "deleted", "case_id": case_id}
