"""
FORENSIC-X Vendor Adapter Base Interface & Registry
Defines plug-in contract so proprietary recorder disk formats map into the Common Evidence Schema.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Type
from forensic_core.schema import SegmentRecord


class VendorAdapter(ABC):
    """Abstract interface that every DVR vendor adapter must implement."""

    @property
    @abstractmethod
    def brand_name(self) -> str:
        """Name of the DVR brand/format handled by this adapter."""
        pass

    @abstractmethod
    def detect(self, disk_image_path: str) -> bool:
        """
        Inspects headers, magic bytes, or file structures to check
        if this image belongs to this vendor brand.
        """
        pass

    @abstractmethod
    def read_index(self, disk_image_path: str) -> List[SegmentRecord]:
        """
        Parses the vendor's proprietary index table and returns active recorded segments.
        """
        pass

    @abstractmethod
    def extract_segment(
        self, disk_image_path: str, segment: SegmentRecord, output_path: str
    ) -> bool:
        """
        Extracts the raw segment from disk and outputs a playable standard video file.
        """
        pass


class AdapterRegistry:
    """Manages adapter detection with fallback to generic carver."""

    _adapters: List[VendorAdapter] = []

    @classmethod
    def register(cls, adapter: VendorAdapter):
        cls._adapters.append(adapter)

    @classmethod
    def get_registered_adapters(cls) -> List[VendorAdapter]:
        return list(cls._adapters)

    @classmethod
    def detect_adapter(cls, disk_image_path: str) -> Optional[VendorAdapter]:
        """Runs detect() across all registered adapters in priority order."""
        for adapter in cls._adapters:
            try:
                if adapter.detect(disk_image_path):
                    return adapter
            except Exception:
                continue
        return None
