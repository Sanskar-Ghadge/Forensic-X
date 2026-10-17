"""
FORENSIC-X Common Evidence Schema
Standardized dataclasses for CCTV video evidence, provenance, and logs.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone


@dataclass
class RecorderEvidence:
    id: str
    brand: str
    adapter_used: str
    image_path: str
    image_hash: str
    file_size_bytes: int
    acquired_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass
class CameraInfo:
    channel: int
    location_name: str
    clock_offset_s: float = 0.0
    offset_error_s: float = 0.0
    status: str = "ok"  # "ok" | "gaps" | "offset_uncertain"


@dataclass
class SegmentRecord:
    id: str
    channel: int
    start_timestamp: int
    start_iso: str
    duration_s: float
    disk_offset: int
    length_bytes: int
    sha256_hash: str
    status: str = "active"  # "active" | "recovered" | "partial"
    method: str = "index"   # "index" | "carved"
    corrected_start_iso: Optional[str] = None
    file_path: Optional[str] = None


@dataclass
class LogEvent:
    timestamp: Optional[int]
    iso_time: str
    level: str  # "INFO" | "WARN" | "ALARM" | "SYSTEM" | "TIME"
    category: str
    message: str


@dataclass
class GapRecord:
    id: str
    channel: int
    start_iso: str
    end_iso: str
    duration_s: float
    verdict: str  # e.g. "disconnected" | "deleted" | "undetermined"
    confidence: float
    evidence_for: List[str] = field(default_factory=list)
    evidence_against: List[str] = field(default_factory=list)


@dataclass
class ForensicCaseReport:
    case_id: str
    name: str
    incident_time: str
    recorders: List[RecorderEvidence] = field(default_factory=list)
    cameras: List[CameraInfo] = field(default_factory=list)
    segments: List[SegmentRecord] = field(default_factory=list)
    gaps: List[GapRecord] = field(default_factory=list)
    logs: List[LogEvent] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
