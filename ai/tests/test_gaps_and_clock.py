"""
Unit tests for AI Gap Causal Reasoning and Clock Synchronization (Phase 4).
"""

import unittest
from ai.clock import ClockCalibration, ClockSynchronizer
from ai.gaps import GapAnalyzer


class TestGapAndClock(unittest.TestCase):
    def test_clock_calibration_conversion(self):
        # CAM 2 is +4.0s ahead of reference time
        cal = ClockCalibration(
            camera_id="CAM-02",
            channel=2,
            offset_seconds=4.0,
            uncertainty_seconds=0.05,
            anchor_type="log_sync",
            anchor_timestamp_iso="2026-03-29T21:40:00+00:00",
        )

        raw_iso = "2026-03-29T21:45:04+00:00"
        corrected_iso = cal.raw_to_corrected(raw_iso)
        self.assertIn("21:45:00", corrected_iso)

        roundtrip_raw = cal.corrected_to_raw(corrected_iso)
        self.assertIn("21:45:04", roundtrip_raw)

        # Second offsets
        self.assertEqual(cal.raw_seconds_to_corrected(304.0), 300.0)
        self.assertEqual(cal.corrected_seconds_to_raw(300.0), 304.0)

    def test_clock_synchronizer(self):
        sync = ClockSynchronizer()
        sync.register_calibration(
            camera_id="CAM-02",
            channel=2,
            offset_seconds=4.0,
            uncertainty_seconds=0.05,
        )

        raw_sec, unc = sync.align_playback_cursor(300.0, "CAM-02")
        self.assertEqual(raw_sec, 304.0)
        self.assertEqual(unc, 0.05)

        # Unregistered camera defaults to identity
        raw_cam1, unc1 = sync.align_playback_cursor(300.0, "CAM-01")
        self.assertEqual(raw_cam1, 300.0)
        self.assertEqual(unc1, 0.0)

    def test_gap_analysis_camera_disconnect(self):
        analyzer = GapAnalyzer()
        logs = [
            {"event_type": "VIDEO_LOSS", "channel": 3, "timestamp": "2026-03-29T21:40:02+00:00"},
            {"event_type": "VIDEO_RECONNECT", "channel": 3, "timestamp": "2026-03-29T21:55:10+00:00"},
        ]

        diag = analyzer.analyze_gap(
            gap_id="GAP-001",
            camera_id="CAM-03",
            channel=3,
            start_iso="2026-03-29T21:40:02+00:00",
            end_iso="2026-03-29T21:55:10+00:00",
            system_logs=logs,
        )

        self.assertEqual(diag.duration_seconds, 908.0)
        self.assertEqual(diag.primary_hypothesis.cause, "camera_disconnected")
        self.assertEqual(diag.primary_hypothesis.confidence, 0.80)
        self.assertGreaterEqual(len(diag.primary_hypothesis.supporting_evidence), 2)
        self.assertGreaterEqual(len(diag.primary_hypothesis.contradicting_evidence), 2)
        self.assertTrue(any("Video-Loss" in s for s in diag.primary_hypothesis.supporting_evidence))

    def test_gap_analysis_deleted_fragment(self):
        analyzer = GapAnalyzer()
        logs = [
            {"event_type": "DELETE_SEGMENT", "channel": 2, "timestamp": "2026-03-29T21:46:00+00:00"}
        ]

        diag = analyzer.analyze_gap(
            gap_id="GAP-002",
            camera_id="CAM-02",
            channel=2,
            start_iso="2026-03-29T21:45:00+00:00",
            end_iso="2026-03-29T21:48:00+00:00",
            system_logs=logs,
            unallocated_carve_hits=1,
        )

        self.assertEqual(diag.primary_hypothesis.cause, "deleted")
        self.assertGreaterEqual(diag.primary_hypothesis.confidence, 0.90)


if __name__ == "__main__":
    unittest.main()
