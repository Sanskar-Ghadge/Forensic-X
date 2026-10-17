"""
Search Router: Cross-camera Re-ID, appearance search, and trajectory validation.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from ai.search import SearchEngine, CameraTopology

router = APIRouter(prefix="/api/cases/{case_id}/search", tags=["search"])

engine = SearchEngine()


class FeedbackPayload(BaseModel):
    lead_id: str
    status: str = Field(..., description="'verified' or 'rejected'")
    notes: Optional[str] = None


@router.get("")
def search_leads(
    case_id: str,
    q: str = Query("person in red jacket", description="Appearance description or search prompt"),
    min_similarity: float = Query(0.65, ge=0.0, le=1.0, description="Similarity threshold cutoff"),
    camera: Optional[str] = Query(None, description="Camera ID filter"),
    pass_tier: Optional[int] = Query(None, description="Pass 1 or Pass 2 filter"),
    only_plausible: bool = Query(False, description="Filter only physically plausible trajectories"),
):
    results = engine.search(
        query_text=q,
        min_similarity=min_similarity,
        camera_filter=camera,
        pass_tier=pass_tier,
        only_plausible=only_plausible,
    )

    # Format into serializable dictionary
    leads_data = []
    for lead in results["leads"]:
        leads_data.append({
            "id": lead.id,
            "case_id": lead.case_id,
            "camera_id": lead.camera_id,
            "camera_name": lead.camera_name,
            "channel": lead.channel,
            "corrected_sec": lead.corrected_sec,
            "corrected_timestamp_iso": lead.corrected_timestamp_iso,
            "raw_timestamp_iso": lead.raw_timestamp_iso,
            "uncertainty_seconds": lead.uncertainty_seconds,
            "similarity": lead.similarity,
            "label": lead.label,
            "bbox": lead.bbox,
            "thumbnail_url": lead.thumbnail_url,
            "clip_hash": lead.clip_hash,
            "model_detector": lead.model_detector,
            "model_embedder": lead.model_embedder,
            "pass_tier": lead.pass_tier,
            "is_rejected": lead.is_rejected,
        })

    hops_data = []
    for h in results["trajectory_hops"]:
        hops_data.append({
            "from_camera_id": h.from_camera_id,
            "to_camera_id": h.to_camera_id,
            "from_camera_name": h.from_camera_name,
            "to_camera_name": h.to_camera_name,
            "from_corrected_sec": h.from_corrected_sec,
            "to_corrected_sec": h.to_corrected_sec,
            "elapsed_seconds": h.elapsed_seconds,
            "min_expected_walking_sec": h.min_expected_walking_sec,
            "is_plausible": h.is_plausible,
            "warning_reason": h.warning_reason,
        })

    return {
        "query": results["query"],
        "min_similarity": results["min_similarity"],
        "total_matches": results["total_matches"],
        "hidden_below_threshold": results["hidden_below_threshold"],
        "leads": leads_data,
        "trajectory_hops": hops_data,
        "legal_notice": "Matches are investigative leads based on visual similarity; human verification required.",
    }


@router.post("/feedback")
def submit_search_feedback(case_id: str, feedback: FeedbackPayload):
    for lead in engine._corpus:
        if lead.id == feedback.lead_id:
            if feedback.status == "rejected":
                lead.is_rejected = True
            lead.metadata["investigator_feedback"] = feedback.status
            lead.metadata["feedback_notes"] = feedback.notes
            return {
                "status": "updated",
                "lead_id": lead.id,
                "investigator_status": feedback.status,
            }

    raise HTTPException(status_code=404, detail="Lead ID not found")
