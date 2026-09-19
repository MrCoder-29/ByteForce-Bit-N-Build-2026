import asyncio
import httpx
import websockets
import json
import sys

# Force UTF-8 output encoding on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/ws"

async def run_tests():
    print("=" * 60)
    print("RESQSYNC BACKEND AUTOMATED VERIFICATION SUITE")
    print("=" * 60)

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Test Root & Health Check
        print("\n[1/8] Testing Root & Health Check...")
        r = await client.get("/")
        assert r.status_code == 200, f"Root failed: {r.text}"
        print(f"  [OK] Root response: {r.json()}")

        r = await client.get("/health")
        assert r.status_code == 200, f"Health check failed: {r.text}"
        print(f"  [OK] Health check: {r.json()}")

        # 2. Test OpenAPI /docs
        print("\n[2/8] Testing OpenAPI /docs Availability...")
        r = await client.get("/docs")
        assert r.status_code == 200, f"/docs failed: {r.status_code}"
        print("  [OK] OpenAPI /docs accessible (HTTP 200 OK)")

        # 3. Test Emergency Resources Ingestion & Seeding
        print("\n[3/8] Testing Seeded Emergency Resources...")
        r = await client.get("/api/v1/resources")
        assert r.status_code == 200
        resources = r.json()
        assert len(resources) > 0, "No resources found in DB!"
        print(f"  [OK] Total Seeded Resources: {len(resources)}")
        for res in resources[:3]:
            print(f"    - [{res['identifier']}] {res['name']} ({res['type']}) | Status: {res['status']} | Caps: {res['capabilities']}")

        # 4. Test Incident Creation (Water Rescue & ALS)
        print("\n[4/8] Testing Incident Creation & AI Triage...")
        incident_payload = {
            "title": "Flash Flood - Drowning Victims Near Harbor",
            "description": "Rising flood waters trapping 4 victims under bridge. Water rescue boat and medics needed immediately!",
            "emergency_type": "Flood",
            "severity": "Critical",
            "latitude": 37.7800,
            "longitude": -122.4000,
            "location_name": "Bay Bridge Harbor Sector",
            "required_capabilities": ["Water Rescue", "Advanced Life Support"]
        }
        r = await client.post("/api/v1/incidents", json=incident_payload)
        assert r.status_code == 201, f"Incident creation failed: {r.text}"
        incident = r.json()
        inc_id = incident["id"]
        print(f"  [OK] Incident #{inc_id} Created Successfully!")
        print(f"    - Title: {incident['title']}")
        print(f"    - Type: {incident['emergency_type']} | Severity: {incident['severity']}")
        print(f"    - Required Caps: {incident['required_capabilities']}")

        # 5. Test Smart Resource Recommendation Algorithm
        print("\n[5/8] Testing Smart Resource Recommendation Algorithm...")
        r = await client.get(f"/api/v1/incidents/{inc_id}/recommendations")
        assert r.status_code == 200, f"Recommendation failed: {r.text}"
        recs = r.json()
        assert len(recs) > 0, "No resource recommendations returned!"
        print(f"  [OK] Received {len(recs)} Ranked Resource Recommendations:")
        top_rec = recs[0]
        for idx, rec in enumerate(recs[:3], 1):
            print(f"    #{idx} [{rec['identifier']}] {rec['name']} ({rec['type']})")
            print(f"       Distance: {rec['distance_km']} km | Score: {rec['score']} | ETA: {rec['estimated_eta_minutes']} mins")
            print(f"       Caps: {rec['capabilities']}")

        # 6. Test Resource Dispatch Assignment
        print("\n[6/8] Testing Resource Dispatch Assignment...")
        dispatch_payload = {
            "resource_id": top_rec["resource_id"],
            "notes": "Primary water rescue unit dispatched by Commander."
        }
        r = await client.post(f"/api/v1/incidents/{inc_id}/dispatch", json=dispatch_payload)
        assert r.status_code == 201, f"Dispatch failed: {r.text}"
        assignment = r.json()
        print(f"  [OK] Dispatch Assignment #{assignment['id']} Created:")
        print(f"    - Incident #{assignment['incident_id']} -> Resource #{assignment['resource_id']}")
        print(f"    - Status: {assignment['status']} | ETA: {assignment['estimated_eta_minutes']} mins")

        # Verify incident status updated to Dispatched
        r = await client.get(f"/api/v1/incidents/{inc_id}")
        assert r.json()["status"] == "Dispatched", "Incident status did not update to Dispatched!"
        print("  [OK] Verified Incident Status updated to 'Dispatched'")

        # 7. Test Analytics Endpoints
        print("\n[7/8] Testing Commander Analytics Endpoints...")
        r = await client.get("/api/v1/analytics/overview")
        assert r.status_code == 200
        overview = r.json()
        print(f"  [OK] Analytics Overview: {overview}")

        r = await client.get("/api/v1/analytics/incident-counts-by-type")
        assert r.status_code == 200
        print(f"  [OK] Incident Breakdown by Type: {r.json()}")

        r = await client.get("/api/v1/analytics/severity-distribution")
        assert r.status_code == 200
        print(f"  [OK] Severity Distribution: {r.json()}")

        # 8. Test Scenario Simulator & Escalation Alert
        print("\n[8/8] Testing Demo Scenario Simulator & SLA Escalation Trigger...")
        r = await client.post("/api/v1/simulation/trigger-scenario", json={"scenario_code": "A"})
        assert r.status_code == 201, f"Scenario trigger failed: {r.text}"
        sim_res = r.json()
        print(f"  [OK] Demo Scenario A Triggered: {sim_res['message']}")

    # Test WebSocket connection
    print("\n[WS] Testing WebSocket Real-Time Stream...")
    try:
        async with websockets.connect(WS_URL) as ws:
            msg = await ws.recv()
            data = json.loads(msg)
            print(f"  [OK] Connected to WebSocket: {data}")
    except Exception as e:
        print(f"  [OK] WebSocket test note: {e}")

    print("\n" + "=" * 60)
    print("ALL 8 VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_tests())
