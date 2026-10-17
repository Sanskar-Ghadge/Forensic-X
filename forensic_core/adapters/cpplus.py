"""
FORENSIC-X CP Plus Adapter Stub (Planned Adapter)
"""

import os
from typing import List
from forensic_core.adapters.base import VendorAdapter, AdapterRegistry
from forensic_core.schema import SegmentRecord


class CPPlusAdapter(VendorAdapter):
    """Adapter stub for CP Plus DVR disk formats."""

    @property
    def brand_name(self) -> str:
        return "CP Plus (Planned Adapter)"

    def detect(self, disk_image_path: str) -> bool:
        if not os.path.isfile(disk_image_path):
            return False
        try:
            with open(disk_image_path, "rb") as f:
                first_kb = f.read(4096)
                return b"CPPLUS" in first_kb
        except Exception:
            return False

    def read_index(self, disk_image_path: str) -> List[SegmentRecord]:
        return []

    def extract_segment(
        self, disk_image_path: str, segment: SegmentRecord, output_path: str
    ) -> bool:
        return False


AdapterRegistry.register(CPPlusAdapter())
