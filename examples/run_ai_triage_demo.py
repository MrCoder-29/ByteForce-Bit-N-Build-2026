"""
Demonstration and Usage Example for Member 2 (FastAPI Integration).
Demonstrates incident classification, spatial-temporal + semantic duplicate detection,
commander SitRep generation, responder SOP checklist generation, and offline fallback mode.
"""

import json
from ai_triage import AIService, IncidentInput

def main():
    print("=" * 70)
    print(" BYTEFORCE PS-9: AI ENGINE & TRIAGE MODULE DEMO (MEMBER 1)")
    print("=" * 70)

    service = AIService()

    # 1. Incident Classification Demo
    print("\n--- 1. INCIDENT CLASSIFICATION ---")
    fire_report = IncidentInput(
        id="INC-101",
        description="Massive structural fire at chemical storage facility, black smoke billowing, 3 workers trapped on 2nd floor",
        source="SOS Call",
        latitude=37.7749,
        longitude=-122.4194,
        sensor_data={"smoke_ppm": 550, "temp_celsius": 92}
    )

    triage_result = service.classify_incident(fire_report)
    print("Input Incident:")
    print(json.dumps(fire_report.dict(), indent=2))
    print("\nOutput Triage Assessment:")
    print(json.dumps(triage_result.dict(), indent=2))

    # 2. Duplicate Detection Scenarios
    print("\n--- 2. SPATIAL-TEMPORAL & SEMANTIC DUPLICATE DETECTION ---")

    # Existing active report
    existing_report = IncidentInput(
        id="INC-101",
        description="Massive structural fire at chemical storage facility, black smoke billowing, 3 workers trapped on 2nd floor",
        source="SOS Call",
        latitude=37.7749,
        longitude=-122.4194,
        timestamp="2026-09-19T12:00:00Z"
    )

    # Scenario A: Same Event Nearby (True Duplicate)
    same_event_report = IncidentInput(
        id="INC-102",
        description="Huge warehouse blaze with black smoke and trapped people near 2nd floor",
        source="Citizen Mobile App",
        latitude=37.7752,  # ~30m away
        longitude=-122.4196,
        timestamp="2026-09-19T12:05:00Z"
    )
    dup_res_a = service.check_duplicate(same_event_report, [existing_report])
    print("\n[Scenario A: Same Event Nearby]")
    print(f"Is Duplicate: {dup_res_a.is_duplicate}")
    print(f"Reason: {dup_res_a.reason}")

    # Scenario B: Unrelated Event Nearby (False Duplicate Prevention)
    unrelated_report = IncidentInput(
        id="INC-103",
        description="Two car traffic accident with minor bumper damage",
        source="Traffic Camera AI",
        latitude=37.7750,  # ~15m away!
        longitude=-122.4195,
        timestamp="2026-09-19T12:02:00Z"
    )
    dup_res_b = service.check_duplicate(unrelated_report, [existing_report])
    print("\n[Scenario B: Unrelated Event Nearby]")
    print(f"Is Duplicate: {dup_res_b.is_duplicate}")
    print(f"Reason: {dup_res_b.reason}")

    # 3. Executive Commander SitRep Generation
    print("\n--- 3. EXECUTIVE COMMANDER SITREP ---")
    cluster = {
        "cluster_id": "CL-FIRE-01",
        "emergency_type": "Fire",
        "severity_label": "Critical",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "report_ids": ["INC-101", "INC-102"],
        "consolidated_summary": "Chemical storage facility fire with heavy black smoke and 3 trapped workers.",
        "casualties_estimated": 3,
        "required_capabilities": ["firefighting", "hazmat_containment", "advanced_life_support", "smoke_ventilation"]
    }

    sitrep_result = service.generate_sitrep(cluster, triage_result)
    print("Commander Executive Summary (2 Sentences):")
    print(f"> {sitrep_result.commander_summary}")
    print("\nFull SitRep Object:")
    print(json.dumps(sitrep_result.dict(), indent=2))

    # 4. Tactical Responder SOP Checklist
    print("\n--- 4. TACTICAL RESPONDER SOP CHECKLIST ---")
    sop_result = service.generate_sop(emergency_type="Fire", severity=4)
    print(json.dumps(sop_result.dict(), indent=2))

    print("\n" + "=" * 70)
    print(" DEMO COMPLETED SUCCESSFULLY")
    print("=" * 70)

if __name__ == "__main__":
    main()
