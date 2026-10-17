"""
FORENSIC-X Generic Video Carver
Scans raw unallocated disk sectors for video markers, extracting active and unindexed deleted video.
"""

import os
import struct
import hashlib
from datetime import datetime, timezone
from typing import List, Optional
from forensic_core.schema import SegmentRecord

SEGMENT_HEADER = struct.Struct("<8sHQI")
MAGIC_MOCK = b"MOCKDVR1"


class VideoCarver:
    """
    Performs deep file carving on raw disk images by scanning sector-by-sector
    for known container signatures and video segment headers.
    """

    def __init__(self, sector_size: int = 512):
        self.sector_size = sector_size

    def carve(
        self, disk_image_path: str, known_indexed_offsets: Optional[List[int]] = None
    ) -> List[SegmentRecord]:
        """
        Scans disk image and returns all discovered segments.
        If known_indexed_offsets is provided, flags unindexed segments as deleted/carved.
        """
        if not os.path.isfile(disk_image_path):
            return []

        indexed_set = set(known_indexed_offsets or [])
        carved_segments: List[SegmentRecord] = []
        file_size = os.path.getsize(disk_image_path)

        with open(disk_image_path, "rb") as f:
            offset = 0
            while offset < file_size:
                f.seek(offset)
                chunk = f.read(self.sector_size)
                if not chunk:
                    break

                # Check for MOCKDVR1 magic bytes
                if chunk.startswith(MAGIC_MOCK):
                    f.seek(offset)
                    header_bytes = f.read(SEGMENT_HEADER.size)
                    if len(header_bytes) == SEGMENT_HEADER.size:
                        magic, channel, timestamp, length = SEGMENT_HEADER.unpack(header_bytes)
                        if magic == MAGIC_MOCK and length > 0 and (offset + SEGMENT_HEADER.size + length <= file_size):
                            payload = f.read(length)
                            if len(payload) == length:
                                sha256_hex = hashlib.sha256(payload).hexdigest()
                                start_iso = datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()
                                is_deleted = offset not in indexed_set

                                carved_segments.append(
                                    SegmentRecord(
                                        id=f"CARVE-CH{channel}-{timestamp}",
                                        channel=channel,
                                        start_timestamp=timestamp,
                                        start_iso=start_iso,
                                        duration_s=60.0,  # Estimated duration if not in index
                                        disk_offset=offset,
                                        length_bytes=length,
                                        sha256_hash=sha256_hex,
                                        status="recovered" if is_deleted else "active",
                                        method="carved" if is_deleted else "index",
                                    )
                                )
                                # Advance offset past this segment payload
                                offset += SEGMENT_HEADER.size + length
                                rem = offset % self.sector_size
                                if rem > 0:
                                    offset += self.sector_size - rem
                                continue

                offset += self.sector_size

        return carved_segments
