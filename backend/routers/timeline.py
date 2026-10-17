"""
Timeline Router: Serves synchronized multi-camera timeline data.
"""

import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import CaseModel, CameraModel, SegmentModel, GapModel, RecorderModel
from backend.schemas import TimelineResponse, TimelineTrack, SegmentResponse, GapResponse
from backend.routers.cases import seed_demo_case_if_needed

router = APIRouter(prefix="/api/cases/{case_id}/timeline", tags=["timeline"])


@router.get("", response_model=TimelineResponse)
def get_timeline(case_id: str, db: Session = Depends(get_db)):
    seed_demo_case_if_needed(db)
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    cameras = db.query(CameraModel).join(RecorderModel).filter(RecorderModel.case_id == case_id).all()

    tracks = []
    min_time = None
    max_time = None

    for cam in cameras:
        segments = db.query(SegmentModel).filter(SegmentModel.camera_id == cam.id).all()
        gaps = db.query(GapModel).filter(GapModel.camera_id == cam.id).all()

        seg_responses = []
        for s in segments:
            # Apply clock offset for corrected_start_iso
            dt = datetime.fromtimestamp(s.start_timestamp, tz=timezone.utc)
            corrected_dt = dt - timedelta(seconds=cam.clock_offset_s)
            corrected_iso = corrected_dt.isoformat()

            seg_responses.append(
                SegmentResponse(
                    id=s.id,
                    camera_id=s.camera_id,
                    channel=cam.channel,
                    start_timestamp=s.start_timestamp,
                    start_iso=s.start_iso,
                    corrected_start_iso=corrected_iso,
                    duration_s=s.duration_s,
                    disk_offset=s.disk_offset,
                    length_bytes=s.length_bytes,
                    sha256_hash=s.sha256_hash,
                    status=s.status,
                    method=s.method,
                    file_path=s.file_path,
                )
            )

            if min_time is None or dt < min_time:
                min_time = dt
            end_dt = dt + timedelta(seconds=s.duration_s)
            if max_time is None or end_dt > max_time:
                max_time = end_dt

        gap_responses = []
        for g in gaps:
            ev_for = json.loads(g.evidence_for) if g.evidence_for else []
            ev_against = json.loads(g.evidence_against) if g.evidence_against else []
            gap_responses.append(
                GapResponse(
                    id=g.id,
                    camera_id=g.camera_id,
                    channel=cam.channel,
                    start_iso=g.start_iso,
                    end_iso=g.end_iso,
                    duration_s=g.duration_s,
                    verdict=g.verdict,
                    confidence=g.confidence,
                    evidence_for=ev_for,
                    evidence_against=ev_against,
                )
            )

        tracks.append(
            TimelineTrack(
                camera_id=cam.id,
                channel=cam.channel,
                location_name=cam.location_name,
                clock_offset_s=cam.clock_offset_s,
                offset_error_s=cam.offset_error_s,
                status=cam.status,
                segments=seg_responses,
                gaps=gap_responses,
            )
        )

    # Sort tracks by channel number
    tracks.sort(key=lambda t: t.channel)

    return TimelineResponse(
        case_id=case.id,
        incident_time=case.incident_time,
        time_window={
            "min_iso": min_time.isoformat() if min_time else "2026-10-17T21:40:00Z",
            "max_iso": max_time.isoformat() if max_time else "2026-10-17T21:58:00Z",
        },
        tracks=tracks,
    )
