"""
Integration tests for FastAPI Search Router.
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app


class TestSearchRouter(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_search_endpoint_default(self):
        resp = self.client.get("/api/cases/CASE-2026-APEX-01/search?q=red+backpack&min_similarity=0.65")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        self.assertIn("leads", data)
        self.assertEqual(len(data["leads"]), 3)
        self.assertIn("trajectory_hops", data)
        self.assertEqual(len(data["trajectory_hops"]), 2)
        self.assertIn("legal_notice", data)
        self.assertIn("investigative leads", data["legal_notice"])

    def test_search_feedback_rejection(self):
        payload = {
            "lead_id": "LEAD-004-LOW",
            "status": "rejected",
            "notes": "Pedestrian clothing does not match jacket shade."
        }
        resp = self.client.post("/api/cases/CASE-2026-APEX-01/search/feedback", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "updated")
        self.assertEqual(data["investigator_status"], "rejected")


if __name__ == "__main__":
    unittest.main()
