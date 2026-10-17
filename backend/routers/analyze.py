"""
Analyze Router: Launches and tracks background forensic core processing.
"""

import time
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.jobs import JobManager
from backend.schemas import JobStatusResponse
from backend.models import CaseModel

router = APIRouter(tags=["analysis"])


def _simulate_analysis_job(job_id: str, case_id: str):
    """Executes the analysis stages and updates progress."""
    JobManager.update_progress(job_id, 10, "Stage 1/5: Write-block verification & SHA-256 fingerprinting")
    time.sleep(0.5)

    JobManager.update_progress(job_id, 35, "Stage 2/5: Reading sector 0 index table")
    time.sleep(0.6)

    JobManager.update_progress(job_id, 65, "Stage 3/5: Deep sector carving for deleted footage")
    time.sleep(0.7)

    JobManager.update_progress(job_id, 85, "Stage 4/5: DVR system log parsing & clock offset calibration")
    time.sleep(0.5)

    JobManager.update_progress(job_id, 100, "Stage 5/5: Pipeline completed. Workspace ready", status="completed")


@router.post("/api/cases/{case_id}/analyze", response_model=JobStatusResponse)
def launch_analysis(case_id: str, db: Session = Depends(get_db)):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
    JobManager.create_job(job_id, case_id)
    JobManager.run_async(job_id, case_id, _simulate_analysis_job)

    return JobStatusResponse(
        id=job_id,
        case_id=case_id,
        status="running",
        progress=10,
        stage="Initializing pipeline",
    )


@router.get("/api/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str):
    job = JobManager.get_job(job_id)
    if job.get("status") == "not_found":
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatusResponse(
        id=job["id"],
        case_id=job.get("case_id", ""),
        status=job["status"],
        progress=job["progress"],
        stage=job["stage"],
        error_message=job.get("error_message"),
    )
