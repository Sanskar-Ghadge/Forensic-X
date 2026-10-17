"""
FORENSIC-X Recovery & Carving Orchestrator
Merges index table parsing with unindexed raw sector carving to restore active and deleted video.
"""

import os
import json
from typing import List, Dict, Any, Optional
from forensic_core.adapters import AdapterRegistry
from forensic_core.carver import VideoCarver
from forensic_core.schema import SegmentRecord, RecorderEvidence


class EvidenceRecoveryEngine:
    """Orchestrates forensic recovery across active indexes and carved raw sectors."""

    def __init__(self, output_dir: str = "extracted_evidence"):
        self.output_dir = output_dir
        self.carver = VideoCarver()

    def process_disk_image(
        self, disk_image_path: str, truth_json_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes a disk image:
        1. Identifies vendor adapter
        2. Reads indexed active segments
        3. Scans raw sectors for unindexed deleted segments (carving)
        4. Calculates recovery metrics against truth.json if available
        """
        if not os.path.isfile(disk_image_path):
            raise FileNotFoundError(f"Disk image not found: {disk_image_path}")

        os.makedirs(self.output_dir, exist_ok=True)

        # 1. Detect adapter
        adapter = AdapterRegistry.detect_adapter(disk_image_path)
        adapter_name = adapter.brand_name if adapter else "Generic Video Carver Fallback"

        indexed_segments: List[SegmentRecord] = []
        indexed_offsets: List[int] = []

        if adapter:
            indexed_segments = adapter.read_index(disk_image_path)
            indexed_offsets = [s.disk_offset for s in indexed_segments]

        # 2. Carve raw sectors for deleted/unindexed footage
        all_carved = self.carver.carve(disk_image_path, known_indexed_offsets=indexed_offsets)

        # Segments that exist on disk but were not in the index table
        deleted_recovered = [s for s in all_carved if s.status == "recovered"]

        # Merge segments
        all_segments: List[SegmentRecord] = list(indexed_segments) + deleted_recovered

        # Sort all segments by channel and start timestamp
        all_segments.sort(key=lambda s: (s.channel, s.start_timestamp))

        # 3. Extract and verify segments
        extracted_files = []
        for seg in all_segments:
            out_file = os.path.join(
                self.output_dir, f"ch{seg.channel}_{seg.start_timestamp}_{seg.status}.mp4"
            )
            # Use adapter extraction or carve extraction
            if adapter and seg.method == "index":
                adapter.extract_segment(disk_image_path, seg, out_file)
            else:
                # Carved direct extraction
                self._extract_raw_bytes(disk_image_path, seg, out_file)
            extracted_files.append(out_file)

        # 4. Compare with ground truth if available
        metrics = self._evaluate_truth(deleted_recovered, truth_json_path)

        return {
            "adapter_used": adapter_name,
            "total_segments_found": len(all_segments),
            "active_segments": len(indexed_segments),
            "deleted_recovered_segments": len(deleted_recovered),
            "segments": all_segments,
            "metrics": metrics,
        }

    def _extract_raw_bytes(self, disk_image_path: str, seg: SegmentRecord, out_path: str):
        import struct
        seg_header = struct.Struct("<8sHQI")
        with open(disk_image_path, "rb") as f:
            f.seek(seg.disk_offset + seg_header.size)
            payload = f.read(seg.length_bytes)
            with open(out_path, "wb") as out_f:
                out_f.write(payload)
        seg.file_path = out_path

    def _evaluate_truth(
        self, recovered_segments: List[SegmentRecord], truth_path: Optional[str]
    ) -> Dict[str, Any]:
        if not truth_path or not os.path.isfile(truth_path):
            return {"status": "no_truth_file"}

        try:
            with open(truth_path, "r", encoding="utf-8") as f:
                truth = json.load(f)

            known_deleted = [
                s for s in truth.get("segments", []) if not s.get("is_indexed", True)
            ]
            known_deleted_count = len(known_deleted)
            recovered_count = len(recovered_segments)

            rate = (
                (recovered_count / known_deleted_count) * 100.0
                if known_deleted_count > 0
                else 100.0
            )

            return {
                "known_deleted_clips": known_deleted_count,
                "recovered_deleted_clips": recovered_count,
                "recovery_success_rate_percent": round(rate, 2),
                "evaluation_verdict": "PASS" if recovered_count >= known_deleted_count else "FAIL",
            }
        except Exception as e:
            return {"status": "error_evaluating_truth", "error": str(e)}
