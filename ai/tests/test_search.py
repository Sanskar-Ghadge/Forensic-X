"""
Unit tests for AI Appearance Search and Trajectory Plausibility (Phase 5).
"""

import unittest
from ai.search import SearchEngine, SearchLead, CameraTopology, TrajectoryHop


class TestSearchEngine(unittest.TestCase):
    def setUp(self):
        self.engine = SearchEngine()
        self.engine.populate_demo_corpus("CASE-2026-APEX-01")

    def test_search_default_corpus(self):
        res = self.engine.search(query_text="person in red jacket", min_similarity=0.65)
        self.assertEqual(res["total_matches"], 3)
        self.assertEqual(res["hidden_below_threshold"], 1)

        # Check chronological ordering by corrected time
        leads = res["leads"]
        self.assertLess(leads[0].corrected_sec, leads[1].corrected_sec)
        self.assertLess(leads[1].corrected_sec, leads[2].corrected_sec)
        self.assertEqual(leads[0].camera_id, "CAM-01")
        self.assertEqual(leads[1].camera_id, "CAM-02")
        self.assertEqual(leads[2].camera_id, "CAM-03")

    def test_threshold_filtering(self):
        # Lower threshold to 0.50 should include the 4th lead (0.58)
        res_low = self.engine.search(min_similarity=0.50)
        self.assertEqual(res_low["total_matches"], 4)
        self.assertEqual(res_low["hidden_below_threshold"], 0)

        # Raise threshold to 0.90 should return only 1 top lead (0.92)
        res_high = self.engine.search(min_similarity=0.90)
        self.assertEqual(res_high["total_matches"], 1)
        self.assertEqual(res_high["leads"][0].id, "LEAD-001")

    def test_camera_filtering(self):
        res = self.engine.search(camera_filter="CAM-02", min_similarity=0.65)
        self.assertEqual(res["total_matches"], 1)
        self.assertEqual(res["leads"][0].camera_id, "CAM-02")
        self.assertEqual(res["leads"][0].camera_name, "Aisle 4 (Beverages)")

    def test_trajectory_plausibility(self):
        res = self.engine.search(min_similarity=0.65)
        hops = res["trajectory_hops"]
        self.assertEqual(len(hops), 2)

        # Hop 1: CAM-01 (135s) -> CAM-02 (378s), elapsed = 243s >= 30s
        self.assertTrue(hops[0].is_plausible)
        self.assertIsNone(hops[0].warning_reason)

        # Hop 2: CAM-02 (378s) -> CAM-03 (962s), elapsed = 584s >= 25s
        self.assertTrue(hops[1].is_plausible)

    def test_implausible_trajectory_detection(self):
        # Construct an impossible hop: 2s elapsed between CAM-01 and CAM-02
        fast_lead = SearchLead(
            id="LEAD-ANOMALY",
            case_id="CASE-2026-APEX-01",
            camera_id="CAM-02",
            camera_name="Aisle 4 (Beverages)",
            channel=2,
            corrected_sec=137.0,  # Only 2 seconds after CAM-01 (135s)
            corrected_timestamp_iso="2026-03-29T21:42:17+00:00",
            raw_timestamp_iso="2026-03-29T21:42:21+00:00",
            uncertainty_seconds=0.05,
            similarity=0.85,
            label="Lead: Anomaly Fast Walker",
            bbox=[100, 100, 50, 50],
            thumbnail_url="/sample/cam2_aisle4_deleted.mp4",
            clip_hash="test-hash",
        )

        leads = [self.engine._corpus[0], fast_lead]
        hops = self.engine.evaluate_trajectory(leads)

        self.assertEqual(len(hops), 1)
        self.assertFalse(hops[0].is_plausible)
        self.assertIsNotNone(hops[0].warning_reason)
        self.assertIn("faster than minimum physical walking time", hops[0].warning_reason)


if __name__ == "__main__":
    unittest.main()
