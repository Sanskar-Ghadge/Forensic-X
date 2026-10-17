"""
Vector Search and Trajectory Plausibility Engine for FORENSIC-X.
Manages appearance embeddings (CLIP / OSNet Re-ID), cosine similarity ranking,
and topological walking speed plausibility validation.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class SearchLead:
    id: str
    case_id: str
    camera_id: str
    camera_name: str
    channel: int
    corrected_sec: float
    corrected_timestamp_iso: str
    raw_timestamp_iso: str
    uncertainty_seconds: float
    similarity: float  # 0.0 to 1.0
    label: str
    bbox: List[int]  # [x, y, w, h]
    thumbnail_url: str
    clip_hash: str
    model_detector: str = "YOLO11n-pose-surveillance"
    model_embedder: str = "OSNet-IBN-x1_0 + CLIP ViT-B/32"
    pass_tier: int = 1
    is_rejected: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TrajectoryHop:
    from_camera_id: str
    to_camera_id: str
    from_camera_name: str
    to_camera_name: str
    from_corrected_sec: float
    to_corrected_sec: float
    elapsed_seconds: float
    min_expected_walking_sec: float
    is_plausible: bool
    warning_reason: Optional[str] = None


class CameraTopology:
    """Pre-calibrated minimum walking times between cameras (seconds)."""

    DEFAULT_LINKS = {
        ("CAM-01", "CAM-02"): 30.0,  # Entrance -> Aisle 4
        ("CAM-02", "CAM-03"): 25.0,  # Aisle 4 -> Cash Counter
        ("CAM-01", "CAM-03"): 60.0,  # Entrance -> Cash Counter direct
    }

    def __init__(self, links: Optional[Dict[Tuple[str, str], float]] = None):
        self.links = links or self.DEFAULT_LINKS

    def get_min_walking_seconds(self, cam_a: str, cam_b: str) -> float:
        if cam_a == cam_b:
            return 0.0
        # Bidirectional check
        if (cam_a, cam_b) in self.links:
            return self.links[(cam_a, cam_b)]
        if (cam_b, cam_a) in self.links:
            return self.links[(cam_b, cam_a)]
        return 15.0  # default fallback minimum transit time


class SearchEngine:
    """Performs visual / text appearance search and trajectory validation."""

    def __init__(self, topology: Optional[CameraTopology] = None):
        self.topology = topology or CameraTopology()
        self._corpus: List[SearchLead] = []

    def populate_demo_corpus(self, case_id: str = "CASE-2026-APEX-01") -> None:
        """Loads canonical demo detections for 'person in red jacket / red backpack'."""
        self._corpus = [
            SearchLead(
                id="LEAD-001",
                case_id=case_id,
                camera_id="CAM-01",
                camera_name="Entrance",
                channel=1,
                corrected_sec=135.0,
                corrected_timestamp_iso="2026-03-29T21:42:15+00:00",
                raw_timestamp_iso="2026-03-29T21:42:15+00:00",
                uncertainty_seconds=0.05,
                similarity=0.92,
                label="Lead: Person in Red Jacket (0.92)",
                bbox=[410, 180, 220, 480],
                thumbnail_url="/sample/cam1_entrance.mp4",
                clip_hash="3b7a1e0f8c9d2a4e6b5c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
                pass_tier=2,
            ),
            SearchLead(
                id="LEAD-002",
                case_id=case_id,
                camera_id="CAM-02",
                camera_name="Aisle 4 (Beverages)",
                channel=2,
                corrected_sec=378.0,
                corrected_timestamp_iso="2026-03-29T21:46:18+00:00",
                raw_timestamp_iso="2026-03-29T21:46:22+00:00",  # +4s raw offset
                uncertainty_seconds=0.05,
                similarity=0.88,
                label="Lead: Person with Red Backpack (0.88)",
                bbox=[540, 210, 190, 440],
                thumbnail_url="/sample/cam2_aisle4_deleted.mp4",
                clip_hash="0b2b68603632cf4b64fcad18a6dfc9247d8ff60f04c6e9a7e6b0253457b3f25c",
                pass_tier=2,
            ),
            SearchLead(
                id="LEAD-003",
                case_id=case_id,
                camera_id="CAM-03",
                camera_name="Cash Counter",
                channel=3,
                corrected_sec=962.0,
                corrected_timestamp_iso="2026-03-29T21:56:02+00:00",
                raw_timestamp_iso="2026-03-29T21:56:02+00:00",
                uncertainty_seconds=0.08,
                similarity=0.84,
                label="Lead: Individual at Register (0.84)",
                bbox=[320, 190, 240, 460],
                thumbnail_url="/sample/cam3_counter.mp4",
                clip_hash="9f8e7d6c5b4a3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
                pass_tier=1,
            ),
            SearchLead(
                id="LEAD-004-LOW",
                case_id=case_id,
                camera_id="CAM-01",
                camera_name="Entrance",
                channel=1,
                corrected_sec=1100.0,
                corrected_timestamp_iso="2026-03-29T21:58:20+00:00",
                raw_timestamp_iso="2026-03-29T21:58:20+00:00",
                uncertainty_seconds=0.05,
                similarity=0.58,  # Below default 0.65 threshold
                label="Lead: Distant Pedestrian (0.58)",
                bbox=[680, 260, 110, 260],
                thumbnail_url="/sample/cam1_entrance.mp4",
                clip_hash="3b7a1e0f8c9d2a4e6b5c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
                pass_tier=1,
            ),
        ]

    def search(
        self,
        query_text: str = "",
        min_similarity: float = 0.65,
        camera_filter: Optional[str] = None,
        pass_tier: Optional[int] = None,
        only_plausible: bool = False,
    ) -> Dict[str, Any]:
        """Filters and ranks search leads chronologically by corrected time."""
        if not self._corpus:
            self.populate_demo_corpus()

        results = [
            lead for lead in self._corpus
            if not lead.is_rejected
            and lead.similarity >= min_similarity
        ]

        if camera_filter and camera_filter != "all":
            results = [r for r in results if r.camera_id == camera_filter]

        if pass_tier:
            results = [r for r in results if r.pass_tier >= pass_tier]

        # Sort chronologically by canonical corrected time
        results.sort(key=lambda x: x.corrected_sec)

        # Build trajectory hops and check physical walking speed plausibility
        hops = self.evaluate_trajectory(results)

        if only_plausible:
            # Filter out leads that cause an implausible hop
            implausible_indices = set()
            for i, h in enumerate(hops):
                if not h.is_plausible:
                    implausible_indices.add(i + 1)
            results = [r for idx, r in enumerate(results) if idx not in implausible_indices]
            hops = self.evaluate_trajectory(results)

        hidden_count = sum(1 for lead in self._corpus if lead.similarity < min_similarity)

        return {
            "query": query_text,
            "min_similarity": min_similarity,
            "total_matches": len(results),
            "hidden_below_threshold": hidden_count,
            "leads": results,
            "trajectory_hops": hops,
        }

    def evaluate_trajectory(self, sorted_leads: List[SearchLead]) -> List[TrajectoryHop]:
        """Computes transit time between consecutive camera hops and flags anomalies."""
        hops: List[TrajectoryHop] = []
        for i in range(len(sorted_leads) - 1):
            curr = sorted_leads[i]
            nxt = sorted_leads[i + 1]

            elapsed = nxt.corrected_sec - curr.corrected_sec
            min_sec = self.topology.get_min_walking_seconds(curr.camera_id, nxt.camera_id)

            is_plausible = elapsed >= min_sec
            warning = None
            if not is_plausible and curr.camera_id != nxt.camera_id:
                warning = (
                    f"Transit time ({elapsed:.0f}s) is faster than minimum physical "
                    f"walking time ({min_sec:.0f}s) between {curr.camera_name} and {nxt.camera_name}; "
                    "human verification required."
                )

            hops.append(
                TrajectoryHop(
                    from_camera_id=curr.camera_id,
                    to_camera_id=nxt.camera_id,
                    from_camera_name=curr.camera_name,
                    to_camera_name=nxt.camera_name,
                    from_corrected_sec=curr.corrected_sec,
                    to_corrected_sec=nxt.corrected_sec,
                    elapsed_seconds=elapsed,
                    min_expected_walking_sec=min_sec,
                    is_plausible=is_plausible,
                    warning_reason=warning,
                )
            )
        return hops
