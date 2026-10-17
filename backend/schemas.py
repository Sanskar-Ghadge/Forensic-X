"""
FORENSIC-X Pydantic Request & Response Schemas
Type-safe data contracts for the REST API.
"""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class CaseBase(BaseModel):
    name: str
    incident_time: Optional[str] = None
    notes: Optional[str] = None


class CaseCreate(CaseBase):
    id: str


class CaseResponse(CaseBase):
    id: str
    status: str
    created_at: str
    recorder_count: int = 0
    camera_count: int = 0
    sha256: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SegmentResponse(BaseModel):
    id: str
    camera_id: str
    channel: int
    start_timestamp: int
    start_iso: str
    corrected_start_iso: Optional[str] = None
    duration_s: float
    disk_offset: int
    length_bytes: int
    sha256_hash: str
    status: str  # active | recovered | partial
    method: str  # index | carved
    file_path: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class GapResponse(BaseModel):
    id: str
    camera_id: str
    channel: int
    start_iso: str
    end_iso: str
    duration_s: float
    verdict: str
    confidence: float
    evidence_for: List[str] = []
    evidence_against: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class CameraResponse(BaseModel):
    id: str
    channel: int
    location_name: str
    clock_offset_s: float
    offset_error_s: float
    status: str
    segments: List[SegmentResponse] = []
    gaps: List[GapResponse] = []

    model_config = ConfigDict(from_attributes=True)


class TimelineTrack(BaseModel):
    camera_id: str
    channel: int
    location_name: str
    clock_offset_s: float
    offset_error_s: float
    status: str
    segments: List[SegmentResponse]
    gaps: List[GapResponse]


class TimelineResponse(BaseModel):
    case_id: str
    incident_time: Optional[str]
    time_window: dict
    tracks: List[TimelineTrack]


class LogEventResponse(BaseModel):
    id: int
    iso_time: str
    level: str
    category: str
    message: str

    model_config = ConfigDict(from_attributes=True)


class JobStatusResponse(BaseModel):
    id: str
    case_id: str
    status: str
    progress: int
    stage: str
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MetricsResponse(BaseModel):
    case_id: str
    recovery_success_rate_percent: float
    known_deleted_clips: int
    recovered_deleted_clips: int
    clock_drift_error_s: float
    hash_verification_percent: float
    total_segments: int
    active_segments: int
    verdict: str
