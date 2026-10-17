"""
FORENSIC-X Mock Vendor Adapter
Fully functional adapter for the simulated MOCKDVR1 CCTV recorder format.
"""

import os
import struct
import hashlib
from datetime import datetime, timezone
from typing import List
from forensic_core.adapters.base import VendorAdapter, AdapterRegistry
from forensic_core.schema import SegmentRecord

INDEX_HEADER = struct.Struct("<8sI")
INDEX_ENTRY = struct.Struct("<HQIQI32s")
SEGMENT_HEADER = struct.Struct("<8sHQI")


class MockVendorAdapter(VendorAdapter):
    """Adapter for MOCKDVR1 simulated CCTV recorder images."""

    @property
    def brand_name(self) -> str:
        return "MOCKDVR1 (Simulated Vendor Format)"

    def detect(self, disk_image_path: str) -> bool:
        if not os.path.isfile(disk_image_path):
            return False

        try:
            with open(disk_image_path, "rb") as f:
                header = f.read(8)
                return header == b"MOCKIDX1"
        except Exception:
            return False

    def read_index(self, disk_image_path: str) -> List[SegmentRecord]:
        segments: List[SegmentRecord] = []
        if not os.path.isfile(disk_image_path):
            return segments

        with open(disk_image_path, "rb") as f:
            header_bytes = f.read(INDEX_HEADER.size)
            if len(header_bytes) < INDEX_HEADER.size:
                return segments

            magic, entry_count = INDEX_HEADER.unpack(header_bytes)
            if magic != b"MOCKIDX1":
                return segments

            for i in range(entry_count):
                entry_bytes = f.read(INDEX_ENTRY.size)
                if len(entry_bytes) < INDEX_ENTRY.size:
                    break

                channel, timestamp, duration, disk_offset, length, sha_raw = INDEX_ENTRY.unpack(entry_bytes)
                sha_hex = sha_raw.hex()
                start_iso = datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()

                segments.append(
                    SegmentRecord(
                        id=f"SEG-MOCK-{channel}-{timestamp}",
                        channel=channel,
                        start_timestamp=timestamp,
                        start_iso=start_iso,
                        duration_s=float(duration),
                        disk_offset=disk_offset,
                        length_bytes=length,
                        sha256_hash=sha_hex,
                        status="active",
                        method="index",
                    )
                )

        return segments

    def extract_segment(
        self, disk_image_path: str, segment: SegmentRecord, output_path: str
    ) -> bool:
        if not os.path.isfile(disk_image_path):
            return False

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        with open(disk_image_path, "rb") as f:
            f.seek(segment.disk_offset)
            seg_header_bytes = f.read(SEGMENT_HEADER.size)
            if len(seg_header_bytes) < SEGMENT_HEADER.size:
                return False

            magic, channel, timestamp, length = SEGMENT_HEADER.unpack(seg_header_bytes)
            if magic != b"MOCKDVR1":
                return False

            payload = f.read(length)
            if len(payload) != length:
                return False

            # Verify integrity
            calc_hash = hashlib.sha256(payload).hexdigest()
            if segment.sha256_hash and calc_hash.lower() != segment.sha256_hash.lower():
                print(f"[WARN] Hash mismatch for segment {segment.id}: {calc_hash} != {segment.sha256_hash}")

            with open(output_path, "wb") as out_f:
                out_f.write(payload)

            segment.file_path = output_path
            return True


# Register mock adapter automatically
AdapterRegistry.register(MockVendorAdapter())
