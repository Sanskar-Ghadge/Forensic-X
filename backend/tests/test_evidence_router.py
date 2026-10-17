"""
Unit tests for Evidence Provenance Graph API Router.
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app


class TestEvidenceRouter(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_get_evidence_graph_structure(self):
        resp = self.client.get("/api/cases/CASE-2026-APEX-01/evidence/graph")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        self.assertEqual(data["case_id"], "CASE-2026-APEX-01")
        self.assertIn("nodes", data)
        self.assertIn("edges", data)
        self.assertGreaterEqual(len(data["nodes"]), 10)
        self.assertGreaterEqual(len(data["edges"]), 10)

        # Check node types
        types = {n["type"] for n in data["nodes"]}
        self.assertIn("incident", types)
        self.assertIn("recorder", types)
        self.assertIn("camera", types)
        self.assertIn("segment", types)
        self.assertIn("gap", types)
        self.assertIn("hash", types)

        # Verify no orphan edges (every source and target exists in nodes)
        node_ids = {n["id"] for n in data["nodes"]}
        for edge in data["edges"]:
            self.assertIn(edge["source"], node_ids, f"Edge source {edge['source']} must exist in nodes")
            self.assertIn(edge["target"], node_ids, f"Edge target {edge['target']} must exist in nodes")

    def test_list_evidence(self):
        resp = self.client.get("/api/cases/CASE-2026-APEX-01/evidence")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)


if __name__ == "__main__":
    unittest.main()
