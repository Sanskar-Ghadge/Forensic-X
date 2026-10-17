"""
Integration tests for FORENSIC-X FastAPI backend endpoints.
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app


class TestBackendAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ok")

    def test_02_list_cases_and_seed(self):
        res = self.client.get("/api/cases")
        self.assertEqual(res.status_code, 200)
        cases = res.json()
        self.assertGreater(len(cases), 0)
        apex = next((c for c in cases if c["id"] == "CASE-2026-APEX-01"), None)
        self.assertIsNotNone(apex)
        self.assertEqual(apex["name"], "Retail Store Incident — 2026-10-17")
        self.assertEqual(apex["camera_count"], 3)

    def test_03_get_timeline_tracks(self):
        res = self.client.get("/api/cases/CASE-2026-APEX-01/timeline")
        self.assertEqual(res.status_code, 200)
        timeline = res.json()
        self.assertEqual(timeline["case_id"], "CASE-2026-APEX-01")
        tracks = timeline["tracks"]
        self.assertEqual(len(tracks), 3)

        # Track 1 (Entrance): should have 2 segments (1 active, 1 carved)
        t1 = next(t for t in tracks if t["channel"] == 1)
        self.assertEqual(len(t1["segments"]), 2)
        carved = next(s for s in t1["segments"] if s["status"] == "recovered")
        self.assertEqual(carved["method"], "carved")

        # Track 2 (Aisle 4): clock offset 4.0s
        t2 = next(t for t in tracks if t["channel"] == 2)
        self.assertEqual(t2["clock_offset_s"], 4.0)

        # Track 3 (Cash Counter): should have 1 gap
        t3 = next(t for t in tracks if t["channel"] == 3)
        self.assertEqual(len(t3["gaps"]), 1)
        self.assertEqual(t3["gaps"][0]["verdict"], "disconnected")

    def test_04_get_gaps(self):
        res = self.client.get("/api/cases/CASE-2026-APEX-01/gaps")
        self.assertEqual(res.status_code, 200)
        gaps = res.json()
        self.assertGreater(len(gaps), 0)
        gap = gaps[0]
        self.assertEqual(gap["channel"], 3)
        self.assertEqual(gap["duration_s"], 908.0)

    def test_05_get_metrics(self):
        res = self.client.get("/api/cases/CASE-2026-APEX-01/metrics")
        self.assertEqual(res.status_code, 200)
        metrics = res.json()
        self.assertEqual(metrics["recovery_success_rate_percent"], 100.0)
        self.assertEqual(metrics["verdict"], "PASS")

    def test_06_evidence_verification(self):
        res = self.client.get("/api/cases/CASE-2026-APEX-01/evidence")
        self.assertEqual(res.status_code, 200)
        evidence = res.json()
        self.assertGreater(len(evidence), 0)


if __name__ == "__main__":
    unittest.main()
