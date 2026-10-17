"""
FORENSIC-X Adapter Package Initialization
Imports and registers all available vendor adapters and fallback carvers.
"""

from forensic_core.adapters.base import VendorAdapter, AdapterRegistry
from forensic_core.adapters.mock_vendor import MockVendorAdapter
from forensic_core.adapters.generic_export import GenericExportAdapter
from forensic_core.adapters.hikvision import HikvisionAdapter
from forensic_core.adapters.dahua import DahuaAdapter
from forensic_core.adapters.cpplus import CPPlusAdapter

__all__ = [
    "VendorAdapter",
    "AdapterRegistry",
    "MockVendorAdapter",
    "GenericExportAdapter",
    "HikvisionAdapter",
    "DahuaAdapter",
    "CPPlusAdapter",
]
