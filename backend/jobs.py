"""
FORENSIC-X Background Job Runner
Tracks analysis progress, carving progress, and updates database state asynchronously.
"""

import time
import threading
from typing import Dict, Any, Callable
from backend.database import SessionLocal
from backend.models import AnalysisJobModel, CaseModel

# In-memory progress tracking for low-latency frontend polling
_ACTIVE_JOBS: Dict[str, Dict[str, Any]] = {}


class JobManager:
    """Manages background forensic analysis tasks."""

    @staticmethod
    def create_job(job_id: str, case_id: str) -> Dict[str, Any]:
        _ACTIVE_JOBS[job_id] = {
            "id": job_id,
            "case_id": case_id,
            "status": "pending",
            "progress": 0,
            "stage": "Job created",
            "error_message": None,
        }
        db = SessionLocal()
        try:
            job = AnalysisJobModel(
                id=job_id,
                case_id=case_id,
                status="pending",
                progress=0,
                stage="Job created",
            )
            db.add(job)
            db.commit()
        finally:
            db.close()
        return _ACTIVE_JOBS[job_id]

    @staticmethod
    def get_job(job_id: str) -> Dict[str, Any]:
        if job_id in _ACTIVE_JOBS:
            return _ACTIVE_JOBS[job_id]

        db = SessionLocal()
        try:
            job = db.query(AnalysisJobModel).filter(AnalysisJobModel.id == job_id).first()
            if job:
                return {
                    "id": job.id,
                    "case_id": job.case_id,
                    "status": job.status,
                    "progress": job.progress,
                    "stage": job.stage,
                    "error_message": job.error_message,
                }
        finally:
            db.close()

        return {
            "id": job_id,
            "status": "not_found",
            "progress": 0,
            "stage": "Unknown",
            "error_message": "Job ID not found",
        }

    @staticmethod
    def run_async(job_id: str, case_id: str, target_func: Callable[[str, str], None]):
        """Launches target_func in a background thread."""
        thread = threading.Thread(target=target_func, args=(job_id, case_id), daemon=True)
        thread.start()

    @staticmethod
    def update_progress(job_id: str, progress: int, stage: str, status: str = "running"):
        if job_id in _ACTIVE_JOBS:
            _ACTIVE_JOBS[job_id]["progress"] = progress
            _ACTIVE_JOBS[job_id]["stage"] = stage
            _ACTIVE_JOBS[job_id]["status"] = status

        db = SessionLocal()
        try:
            job = db.query(AnalysisJobModel).filter(AnalysisJobModel.id == job_id).first()
            if job:
                job.progress = progress
                job.stage = stage
                job.status = status
                if status == "completed":
                    # Update case status
                    case = db.query(CaseModel).filter(CaseModel.id == job.case_id).first()
                    if case:
                        case.status = "ready"
                db.commit()
        finally:
            db.close()
