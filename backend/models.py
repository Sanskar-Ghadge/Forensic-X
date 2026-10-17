"""
FORENSIC-X Database Models
SQLAlchemy tables matching the Common Evidence Schema.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    ForeignKey,
    Text,
    DateTime,
)
from sqlalchemy.orm import relationship
from backend.database import Base


class CaseModel(Base):
    __tablename__ = "cases"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    status = Column(String(32), default="new")  # "new" | "processing" | "ready"
    incident_time = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(Text, nullable=True)

    recorders = relationship("RecorderModel", back_populates="case", cascade="all, delete-orphan")
    logs = relationship("LogEventModel", back_populates="case", cascade="all, delete-orphan")
    jobs = relationship("AnalysisJobModel", back_populates="case", cascade="all, delete-orphan")


class RecorderModel(Base):
    __tablename__ = "recorders"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False)
    brand = Column(String(64), default="MOCKDVR1")
    adapter_used = Column(String(128), default="MockVendorAdapter")
    image_path = Column(String(512), nullable=False)
    image_hash = Column(String(64), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    acquired_at = Column(String(64), default=lambda: datetime.now(timezone.utc).isoformat())

    case = relationship("CaseModel", back_populates="recorders")
    cameras = relationship("CameraModel", back_populates="recorder", cascade="all, delete-orphan")


class CameraModel(Base):
    __tablename__ = "cameras"

    id = Column(String(64), primary_key=True, index=True)
    recorder_id = Column(String(64), ForeignKey("recorders.id"), nullable=False)
    channel = Column(Integer, nullable=False)
    location_name = Column(String(128), nullable=False)
    clock_offset_s = Column(Float, default=0.0)
    offset_error_s = Column(Float, default=0.0)
    status = Column(String(32), default="ok")  # "ok" | "gaps" | "offset_uncertain"

    recorder = relationship("RecorderModel", back_populates="cameras")
    segments = relationship("SegmentModel", back_populates="camera", cascade="all, delete-orphan")
    gaps = relationship("GapModel", back_populates="camera", cascade="all, delete-orphan")


class SegmentModel(Base):
    __tablename__ = "segments"

    id = Column(String(64), primary_key=True, index=True)
    camera_id = Column(String(64), ForeignKey("cameras.id"), nullable=False)
    start_timestamp = Column(Integer, nullable=False)
    start_iso = Column(String(64), nullable=False)
    corrected_start_iso = Column(String(64), nullable=True)
    duration_s = Column(Float, default=0.0)
    disk_offset = Column(Integer, default=0)
    length_bytes = Column(Integer, default=0)
    sha256_hash = Column(String(64), nullable=False)
    status = Column(String(32), default="active")  # "active" | "recovered" | "partial"
    method = Column(String(32), default="index")   # "index" | "carved"
    file_path = Column(String(512), nullable=True)

    camera = relationship("CameraModel", back_populates="segments")


class LogEventModel(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False)
    timestamp = Column(Integer, nullable=True)
    iso_time = Column(String(64), nullable=False)
    level = Column(String(16), default="INFO")
    category = Column(String(32), default="SYSTEM")
    message = Column(Text, nullable=False)

    case = relationship("CaseModel", back_populates="logs")


class GapModel(Base):
    __tablename__ = "gaps"

    id = Column(String(64), primary_key=True, index=True)
    camera_id = Column(String(64), ForeignKey("cameras.id"), nullable=False)
    start_iso = Column(String(64), nullable=False)
    end_iso = Column(String(64), nullable=False)
    duration_s = Column(Float, default=0.0)
    verdict = Column(String(64), default="undetermined")
    confidence = Column(Float, default=0.0)
    evidence_for = Column(Text, default="[]")  # JSON string
    evidence_against = Column(Text, default="[]")  # JSON string

    camera = relationship("CameraModel", back_populates="gaps")


class AnalysisJobModel(Base):
    __tablename__ = "jobs"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False)
    status = Column(String(32), default="pending")  # "pending" | "running" | "completed" | "failed"
    progress = Column(Integer, default=0)
    stage = Column(String(128), default="Initialized")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    case = relationship("CaseModel", back_populates="jobs")
