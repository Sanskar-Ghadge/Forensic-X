"""
FORENSIC-X Evidence Intake Module
Handles write-blocked read-only disk image access and cryptographic SHA-256 verification.
"""

import os
import hashlib
import time
from typing import Callable, Optional, Tuple


class ForensicIntake:
    """
    Ensures evidentiary integrity by opening evidence in read-only mode
    and generating streaming chunked SHA-256 cryptographic fingerprints.
    """

    def __init__(self, chunk_size: int = 1024 * 1024):  # 1 MB chunks
        self.chunk_size = chunk_size

    def inspect_file(self, file_path: str) -> dict:
        """Inspects file metadata and guarantees read-only access."""
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"Evidence file not found: {file_path}")

        file_stat = os.stat(file_path)
        return {
            "path": os.path.abspath(file_path),
            "filename": os.path.basename(file_path),
            "size_bytes": file_stat.st_size,
            "size_mb": round(file_stat.st_size / (1024 * 1024), 2),
            "is_readable": os.access(file_path, os.R_OK),
            "last_modified": file_stat.st_mtime,
        }

    def compute_sha256(
        self,
        file_path: str,
        progress_callback: Optional[Callable[[float, float], None]] = None,
    ) -> Tuple[str, float]:
        """
        Computes SHA-256 hash using chunked streaming.
        Returns:
            Tuple of (sha256_hex_digest, elapsed_seconds)
        """
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"Evidence file not found: {file_path}")

        file_size = os.path.getsize(file_path)
        hasher = hashlib.sha256()
        bytes_read = 0
        start_time = time.perf_counter()

        with open(file_path, "rb") as f:
            while True:
                chunk = f.read(self.chunk_size)
                if not chunk:
                    break
                hasher.update(chunk)
                bytes_read += len(chunk)
                if progress_callback and file_size > 0:
                    fraction = min(1.0, bytes_read / file_size)
                    elapsed = max(0.001, time.perf_counter() - start_time)
                    mb_per_sec = (bytes_read / (1024 * 1024)) / elapsed
                    progress_callback(fraction, mb_per_sec)

        elapsed_total = time.perf_counter() - start_time
        return hasher.hexdigest(), elapsed_total

    def verify_integrity(self, file_path: str, expected_hash: str) -> bool:
        """Verifies if the file matches the expected cryptographic SHA-256 fingerprint."""
        calculated_hash, _ = self.compute_sha256(file_path)
        return calculated_hash.lower() == expected_hash.strip().lower()
