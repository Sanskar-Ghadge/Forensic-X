"""
Unit and integration tests for the FORENSIC-X Forensic Core Engine.
"""

import os
import unittest
import tempfile
import json
from forensic_core.intake import ForensicIntake
from forensic_core.schema import SegmentRecord
from forensic_core.adapters.mock_vendor import MockVendorAdapter
from forensic_core.adapters.base import AdapterRegistry
from forensic_core.carver import VideoCarver
from forensic_core.recover import EvidenceRecoveryEngine
from forensic_core.logs import LogParser


class TestForensicCore(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        cls.img_path = os.path.join(cls.root_dir, "sample_data", "mock_dvr.img")
        cls.truth_path = os.path.join(cls.root_dir, "sample_data", "truth.json")
        cls.log_path = os.path.join(cls.root_dir, "sample_data", "events.log")

    def test_01_intake_inspection_and_hash(self):
        """Test read-only inspection and SHA-256 computation."""
        intake = ForensicIntake()
        info = intake.inspect_file(self.img_path)
        self.assertTrue(info["is_readable"])
        self.assertGreater(info["size_bytes"], 0)

        digest, elapsed = intake.compute_sha256(self.img_path)
        self.assertEqual(len(digest), 64)
        self.assertGreater(elapsed, 0.0)

        # Check against ground truth
        with open(self.truth_path, "r", encoding="utf-8") as f:
            truth = json.load(f)
        expected_sha = truth["recorders"][0]["sha256"]
        self.assertEqual(digest.lower(), expected_sha.lower())
        self.assertTrue(intake.verify_integrity(self.img_path, expected_sha))

    def test_02_adapter_detection_and_index_parsing(self):
        """Test adapter auto-detection and sector 0 index table parsing."""
        adapter = AdapterRegistry.detect_adapter(self.img_path)
        self.assertIsNotNone(adapter)
        self.assertIn("MOCKDVR1", adapter.brand_name)

        segments = adapter.read_index(self.img_path)
        self.assertEqual(len(segments), 4)

        # Cam 1 active clip
        cam1 = [s for s in segments if s.channel == 1]
        self.assertEqual(len(cam1), 1)
        self.assertEqual(cam1[0].disk_offset, 4096)
        self.assertEqual(cam1[0].duration_s, 120.0)

        # Cam 2 active clip (+4s drift)
        cam2 = [s for s in segments if s.channel == 2]
        self.assertEqual(len(cam2), 1)
        self.assertEqual(cam2[0].channel, 2)

    def test_03_deep_sector_carver(self):
        """Test raw sector carving discovering both active and unindexed deleted segments."""
        carver = VideoCarver()
        # Carve without known index offsets
        all_segments = carver.carve(self.img_path)
        self.assertEqual(len(all_segments), 5)  # 4 active + 1 deleted

        # Carve with known indexed offsets to isolate unindexed/deleted segments
        adapter = MockVendorAdapter()
        indexed = adapter.read_index(self.img_path)
        indexed_offsets = [s.disk_offset for s in indexed]

        carved_with_mask = carver.carve(self.img_path, known_indexed_offsets=indexed_offsets)
        deleted = [s for s in carved_with_mask if s.status == "recovered"]
        self.assertEqual(len(deleted), 1)
        self.assertEqual(deleted[0].channel, 1)
        self.assertEqual(deleted[0].disk_offset, 254464)
        self.assertEqual(deleted[0].method, "carved")

    def test_04_recovery_engine_and_truth_evaluation(self):
        """Test orchestrator combining index parsing, carving, extraction, and truth scoring."""
        with tempfile.TemporaryDirectory() as temp_out:
            engine = EvidenceRecoveryEngine(output_dir=temp_out)
            result = engine.process_disk_image(self.img_path, truth_json_path=self.truth_path)

            self.assertEqual(result["total_segments_found"], 5)
            self.assertEqual(result["active_segments"], 4)
            self.assertEqual(result["deleted_recovered_segments"], 1)

            metrics = result["metrics"]
            self.assertEqual(metrics["known_deleted_clips"], 1)
            self.assertEqual(metrics["recovered_deleted_clips"], 1)
            self.assertEqual(metrics["recovery_success_rate_percent"], 100.0)
            self.assertEqual(metrics["evaluation_verdict"], "PASS")

            # Verify files were extracted to temp directory
            extracted_files = os.listdir(temp_out)
            self.assertGreater(len(extracted_files), 0)

    def test_05_log_parsing_and_gap_correlation(self):
        """Test DVR log parsing and pairing of video loss events."""
        parser = LogParser()
        events = parser.parse_file(self.log_path)
        self.assertEqual(len(events), 8)

        # Video loss interval correlation
        loss_intervals = parser.find_video_loss_intervals()
        self.assertEqual(len(loss_intervals), 1)
        gap = loss_intervals[0]
        self.assertEqual(gap["channel"], 3)
        self.assertEqual(gap["duration_s"], 908.0)
        self.assertEqual(gap["cause"], "physical_camera_disconnect_or_loss")
        self.assertEqual(len(gap["supporting_clues"]), 2)


if __name__ == "__main__":
    unittest.main()
