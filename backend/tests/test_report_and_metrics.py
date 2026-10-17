"""
Unit tests for Report & Metrics endpoints (Phase 7).
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app


class TestReportAndMetrics(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_get_metrics(self):
        resp = self.client.get("/api/cases/CASE-2026-APEX-01/metrics")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["case_id"], "CASE-2026-APEX-01")
        self.assertEqual(data["recovery_success_rate_percent"], 100.0)
        self.assertEqual(data["hash_verification_percent"], 100.0)
        self.assertEqual(data["verdict"], "PASS")

    def test_download_pdf_report(self):
        resp = self.client.get("/api/cases/CASE-2026-APEX-01/report")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("content-type"), "application/pdf")
        self.assertTrue(resp.content.startswith(b"%PDF"))
        self.assertGreater(len(resp.content), 1000)

    def test_generate_custom_report(self):
        payload = {
            "examiner_name": "Special Agent J. Doe",
            "examiner_agency": "Digital Cyber Forensics Unit",
            "included_sections": ["metadata", "hashes", "sync", "carving", "gaps"],
            "custom_notes": "All sectors verified with zero bit divergence.",
        }
        resp = self.client.post("/api/cases/CASE-2026-APEX-01/report/generate", json=payload)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("content-type"), "application/pdf")
        self.assertTrue(resp.content.startswith(b"%PDF"))

    def test_report_summary(self):
        resp = self.client.get("/api/cases/CASE-2026-APEX-01/report/summary")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["case_id"], "CASE-2026-APEX-01")
        self.assertEqual(data["all_hashes_verified"], True)
        self.assertEqual(len(data["carved_clips"]), 1)
        self.assertEqual(len(data["gaps"]), 1)


if __name__ == "__main__":
    unittest.main()
