"""
Clock synchronization and drift correction primitives for FORENSIC-X.
Converts raw DVR clock timestamps to synchronized canonical timeline with error bounds.
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple


@dataclass
class ClockCalibration:
    camera_id: str
    channel: int
    offset_seconds: float  # raw - reference = offset (i.e. raw is ahead by offset_seconds)
    uncertainty_seconds: float
    anchor_type: str  # 'log_sync', 'visual_flash', 'manual_ntp', 'pos_receipt'
    anchor_timestamp_iso: str

    def raw_to_corrected(self, raw_iso: str) -> str:
        """Converts raw timestamp to corrected reference timestamp."""
        dt = datetime.fromisoformat(raw_iso.replace("Z", "+00:00"))
        corrected_dt = dt - timedelta(seconds=self.offset_seconds)
        return corrected_dt.isoformat()

    def corrected_to_raw(self, corrected_iso: str) -> str:
        """Converts corrected reference timestamp back to camera's raw timestamp."""
        dt = datetime.fromisoformat(corrected_iso.replace("Z", "+00:00"))
        raw_dt = dt + timedelta(seconds=self.offset_seconds)
        return raw_dt.isoformat()

    def raw_seconds_to_corrected(self, raw_seconds: float) -> float:
        """Given second offset from case start, returns corrected second offset."""
        return raw_seconds - self.offset_seconds

    def corrected_seconds_to_raw(self, corrected_seconds: float) -> float:
        """Given corrected second offset from case start, returns camera raw second."""
        return corrected_seconds + self.offset_seconds


class ClockSynchronizer:
    """Manages multi-camera clock drifts and uncertainty propagation."""

    def __init__(self):
        self._calibrations: Dict[str, ClockCalibration] = {}

    def register_calibration(
        self,
        camera_id: str,
        channel: int,
        offset_seconds: float,
        uncertainty_seconds: float = 0.05,
        anchor_type: str = "log_sync",
        anchor_timestamp_iso: str = "2026-03-29T21:40:00+00:00",
    ) -> ClockCalibration:
        cal = ClockCalibration(
            camera_id=camera_id,
            channel=channel,
            offset_seconds=offset_seconds,
            uncertainty_seconds=uncertainty_seconds,
            anchor_type=anchor_type,
            anchor_timestamp_iso=anchor_timestamp_iso,
        )
        self._calibrations[camera_id] = cal
        return cal

    def get_calibration(self, camera_id: str) -> Optional[ClockCalibration]:
        return self._calibrations.get(camera_id)

    def align_playback_cursor(
        self,
        master_cursor_sec: float,
        camera_id: str,
    ) -> Tuple[float, float]:
        """
        Returns (camera_raw_second, uncertainty_seconds) for a given master cursor time.
        """
        cal = self._calibrations.get(camera_id)
        if not cal:
            return master_cursor_sec, 0.0
        return cal.corrected_seconds_to_raw(master_cursor_sec), cal.uncertainty_seconds
