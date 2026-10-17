"""
FORENSIC-X Generic Export Adapter
Handles imported folders containing standard CCTV exported video files (MP4, AVI, MKV, H.264).
"""

import os
import hashlib
from datetime import datetime, timezone
from typing import List
from forensic_core.adapters.base import VendorAdapter, AdapterRegistry
from forensic_core.schema import SegmentRecord


class GenericExportAdapter(VendorAdapter):
    """Adapter for directories containing standard exported CCTV files."""

    SUPPORTED_EXTS = (".mp4", ".avi", ".mkv", ".h264", ".ts")

    @property
    def brand_name(self) -> str:
        return "Generic Video Export Importer"

    def detect(self, path: str) -> bool:
        if os.path.isdir(path):
            for root, _, files in os.walk(path):
                if any(f.lower().endswith(self.SUPPORTED_EXTS) for f in files):
                    return True
        return False

    def read_index(self, folder_path: str) -> List[SegmentRecord]:
        segments: List[SegmentRecord] = []
        if not os.path.isdir(folder_path):
            return segments

        channel_counter = 1
        for root, _, files in os.walk(folder_path):
            for file in sorted(files):
                if file.lower().endswith(self.SUPPORTED_EXTS):
                    full_p = os.path.join(root, file)
                    stat = os.stat(full_p)
                    hasher = hashlib.sha256()
                    with open(full_p, "rb") as f:
                        for chunk in iter(lambda: f.read(1024 * 1024), b""):
                            hasher.update(chunk)

                    mtime = int(stat.st_mtime)
                    iso = datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()

                    segments.append(
                        SegmentRecord(
                            id=f"EXP-{file}",
                            channel=channel_counter,
                            start_timestamp=mtime,
                            start_iso=iso,
                            duration_s=60.0,
                            disk_offset=0,
                            length_bytes=stat.st_size,
                            sha256_hash=hasher.hexdigest(),
                            status="active",
                            method="index",
                            file_path=full_p,
                        )
                    )
                    channel_counter += 1

        return segments

    def extract_segment(
        self, disk_image_path: str, segment: SegmentRecord, output_path: str
    ) -> bool:
        if segment.file_path and os.path.isfile(segment.file_path):
            import shutil
            shutil.copy2(segment.file_path, output_path)
            segment.file_path = output_path
            return True
        return False


AdapterRegistry.register(GenericExportAdapter())
