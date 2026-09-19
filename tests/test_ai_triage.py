"""
Unit and Integration Tests for AI Engine & Triage module (Member 1).
"""

import unittest
from datetime import datetime, timezone, timedelta

from ai_triage import (
    AIService,
    IncidentInput,
    TriageResult,
    DuplicateCheckResult,
    SitRepResult,
    SOPResult
)
from ai_triage.duplicate_detector import calculate_text_similarity, haversine_distance_meters

class TestAITriageModule(unittest.TestCase):
    def setUp(self):
        self.ai_service = AIService()

    def test_classification_fire(self):
        incident = IncidentInput(
            id="INC-001",
            description="Massive structural blaze reported at commercial warehouse, heavy smoke and 2 trapped victims",
            source="SOS Call",
            latitude=37.7749,
            longitude=-122.4194,
            sensor_data={"smoke_ppm": 450, "temp_celsius": 85}
        )
        triage = self.ai_service.classify_incident(incident)
        self.assertIsInstance(triage, TriageResult)
        self.assertEqual(triage.emergency_type, "Fire")
        self.assertGreaterEqual(triage.severity_level, 3)
        self.assertIn("firefighting", triage.required_capabilities)

    def test_classification_medical(self):
        incident = IncidentInput(
            id="INC-002",
            description="Elderly patient unconscious with severe chest pain and breathing difficulty",
            source="Citizen Mobile App",
            latitude=37.7750,
            longitude=-122.4190
        )
        triage = self.ai_service.classify_incident(incident)
        self.assertEqual(triage.emergency_type, "Medical")
        self.assertIn("advanced_life_support", triage.required_capabilities)

    def test_duplicate_same_event_nearby(self):
        """Case A: Two reports describing the SAME event nearby (True Duplicate)."""
        now = datetime.now(timezone.utc).isoformat()
        report1 = IncidentInput(
            id="REP-101",
            description="Large chemical gas leak near main highway intersection, pungent odor",
            latitude=34.0522,
            longitude=-118.2437,
            timestamp=now
        )
        report2 = IncidentInput(
            id="REP-102",
            description="Toxic chemical cloud and gas leakage near highway intersection",
            latitude=34.0530,  # ~100m away
            longitude=-118.2440,
            timestamp=now
        )
        result = self.ai_service.check_duplicate(report2, [report1])
        self.assertTrue(result.is_duplicate)
        self.assertEqual(result.duplicate_of_id, "REP-101")
        self.assertGreaterEqual(result.semantic_similarity, 0.25)

    def test_duplicate_unrelated_events_nearby(self):
        """Case B: Two UNRELATED events at nearby location (False Duplicate Prevention)."""
        now = datetime.now(timezone.utc).isoformat()
        fire_report = IncidentInput(
            id="REP-201",
            description="Bakery shop fire with heavy black smoke and flames from roof",
            latitude=34.0522,
            longitude=-118.2437,
            timestamp=now
        )
        crash_report = IncidentInput(
            id="REP-202",
            description="Two-vehicle traffic accident with minor bumper damage",
            latitude=34.0524,  # Only ~25m away!
            longitude=-118.2438,
            timestamp=now
        )
        result = self.ai_service.check_duplicate(crash_report, [fire_report])
        # Should NOT be flagged as duplicate despite close geography
        self.assertFalse(result.is_duplicate)

    def test_duplicate_same_event_different_wording(self):
        """Case C: Same event described with different wording nearby."""
        now = datetime.now(timezone.utc).isoformat()
        report1 = IncidentInput(
            id="REP-301",
            description="Building structural collapse near central avenue market",
            latitude=40.7128,
            longitude=-74.0060,
            timestamp=now
        )
        report2 = IncidentInput(
            id="REP-302",
            description="Commercial building down and rubble collapsed on central street",
            latitude=40.7132,  # ~50m away
            longitude=-74.0062,
            timestamp=now
        )
        result = self.ai_service.check_duplicate(report2, [report1])
        self.assertTrue(result.is_duplicate)

    def test_sitrep_generation(self):
        cluster_data = {
            "cluster_id": "CL-889",
            "emergency_type": "HAZMAT",
            "severity_label": "Critical",
            "latitude": 34.0522,
            "longitude": -118.2437,
            "report_ids": ["REP-101", "REP-102"],
            "consolidated_summary": "Toxic gas leak near major highway crossing.",
            "casualties_estimated": 3,
            "required_capabilities": ["hazmat_containment", "decontamination"]
        }
        sitrep = self.ai_service.generate_sitrep(cluster_data)
        self.assertIsInstance(sitrep, SitRepResult)
        self.assertIsNotNone(sitrep.commander_summary)
        # Verify 2-sentence structure (sentences end with '. ')
        sentences = [s.strip() for s in sitrep.commander_summary.split(". ") if s.strip()]
        self.assertEqual(len(sentences), 2)

    def test_sop_generation(self):
        sop = self.ai_service.generate_sop(emergency_type="Fire", severity=4)
        self.assertIsInstance(sop, SOPResult)
        self.assertEqual(sop.emergency_type, "Fire")
        self.assertGreaterEqual(len(sop.checklist_items), 3)
        self.assertGreaterEqual(len(sop.safety_warnings), 1)
        self.assertIn("AI-generated", sop.ai_disclaimer)

if __name__ == "__main__":
    unittest.main()
