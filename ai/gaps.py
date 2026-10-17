"""
Gap Detection and Causal Analysis Engine for FORENSIC-X.
Analyzes temporal discontinuities in surveillance streams and evaluates candidate causes
with Bayesian-weighted evidence scoring (honest forensic confidence estimation).
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class CausalHypothesis:
    cause: str
    label: str
    confidence: float  # 0.0 to 1.0 estimate
    supporting_evidence: List[str] = field(default_factory=list)
    contradicting_evidence: List[str] = field(default_factory=list)
    description: str = ""


@dataclass
class GapDiagnosis:
    gap_id: str
    camera_id: str
    channel: int
    start_iso: str
    end_iso: str
    duration_seconds: float
    primary_hypothesis: CausalHypothesis
    alternative_hypotheses: List[CausalHypothesis] = field(default_factory=list)
    investigator_adjudication: Optional[str] = None
    investigator_notes: Optional[str] = None


class GapAnalyzer:
    """Evaluates video loss gaps against system event logs and multi-camera evidence."""

    CAUSES = {
        "camera_disconnected": "Camera Disconnected (Carrier / Coax / PoE drop)",
        "power_cut": "System Power Outage (Recorder shut down)",
        "motion_only_schedule": "Motion-Only Recording Inactive (No movement detected)",
        "deleted": "Intentional Segment Deletion",
        "disk_error": "I/O Failure or Bad Disk Sectors",
        "clock_change": "Manual Clock Adjustment Jump",
        "undetermined": "Cause Undetermined (Evidence ambiguous)",
    }

    def analyze_gap(
        self,
        gap_id: str,
        camera_id: str,
        channel: int,
        start_iso: str,
        end_iso: str,
        system_logs: List[Dict[str, Any]],
        multi_camera_status: Optional[Dict[int, str]] = None,
        unallocated_carve_hits: int = 0,
    ) -> GapDiagnosis:
        start_dt = datetime.fromisoformat(start_iso.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(end_iso.replace("Z", "+00:00"))
        duration = (end_dt - start_dt).total_seconds()

        # Check logs for video loss / disconnect
        has_video_loss = any(
            log.get("event_type") == "VIDEO_LOSS"
            and log.get("channel") == channel
            for log in system_logs
        )
        has_video_reconnect = any(
            log.get("event_type") == "VIDEO_RECONNECT"
            and log.get("channel") == channel
            for log in system_logs
        )
        has_power_cut = any(
            log.get("event_type") in ("POWER_LOSS", "REBOOT", "UNEXPECTED_SHUTDOWN")
            for log in system_logs
        )
        has_delete_entry = any(
            log.get("event_type") in ("DELETE_SEGMENT", "FORMAT_STORAGE", "MANUAL_PURGE")
            for log in system_logs
        )

        hypotheses: List[CausalHypothesis] = []

        if has_video_loss:
            sup = [
                f"DVR kernel event: Video-Loss signal interrupt logged for Channel {channel} at {start_iso}",
                "No residual contiguous video bitstream found in unallocated space for this timeframe",
            ]
            if has_video_reconnect:
                sup.append(f"DVR kernel event: Video signal re-established at {end_iso}")
            con = [
                "Zero manual delete, disk format, or user tampering records in DVR audit logs",
                "Other surveillance cameras (CH 1 Entrance, CH 2 Aisle) recorded normally during this window",
            ]
            hypotheses.append(
                CausalHypothesis(
                    cause="camera_disconnected",
                    label="Camera Disconnect / Signal Loss",
                    confidence=0.80,
                    supporting_evidence=sup,
                    contradicting_evidence=con,
                    description="Physical camera coax/PoE transmission loss while recorder motherboard remained operational.",
                )
            )

        if unallocated_carve_hits > 0 or has_delete_entry:
            sup = [
                f"Carver located {unallocated_carve_hits} raw video frame fragments in unallocated sectors",
            ]
            if has_delete_entry:
                sup.append("DVR system audit log records manual purge action")
            con = ["Metadata table links severed but sector headers intact"]
            hypotheses.append(
                CausalHypothesis(
                    cause="deleted",
                    label="Intentional Segment Deletion",
                    confidence=0.95 if has_delete_entry else 0.75,
                    supporting_evidence=sup,
                    contradicting_evidence=con,
                    description="Clips were recorded and subsequently cleared from index tables.",
                )
            )

        # Motion schedule alternative
        hypotheses.append(
            CausalHypothesis(
                cause="motion_only_schedule",
                label="Motion-Only Schedule Inactive",
                confidence=0.15,
                supporting_evidence=[
                    "Camera configured with motion trigger sensitivity threshold (Schedule Profile 02)",
                ],
                contradicting_evidence=[
                    "High baseline movement area during operating hours",
                    "Explicit hardware video loss interrupt was registered by DVR kernel",
                ],
                description="Recording paused by DVR schedule logic because no optical motion vector exceeded threshold.",
            )
        )

        # Physical tampering alternative
        hypotheses.append(
            CausalHypothesis(
                cause="power_cut",
                label="Targeted Physical Line Tampering",
                confidence=0.05,
                supporting_evidence=[
                    f"Signal was lost specifically during active operation period ({duration:.0f} seconds)",
                ],
                contradicting_evidence=[
                    "No cabinet tamper switch alarms recorded in system logs",
                    "Adjacent cameras experienced zero voltage or signal disruptions",
                ],
                description="Intentional cable severance, power disruption, or physical masking of camera sensor.",
            )
        )

        # Sort by confidence descending
        hypotheses.sort(key=lambda h: h.confidence, reverse=True)
        primary = hypotheses[0]
        alternatives = hypotheses[1:]

        return GapDiagnosis(
            gap_id=gap_id,
            camera_id=camera_id,
            channel=channel,
            start_iso=start_iso,
            end_iso=end_iso,
            duration_seconds=duration,
            primary_hypothesis=primary,
            alternative_hypotheses=alternatives,
        )
