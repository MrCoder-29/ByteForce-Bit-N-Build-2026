import asyncio
import httpx
import websockets
import json

async def test_all():
    print("=" * 60)
    print("BYTEFORCE FULL-STACK E2E INTEGRATION VERIFICATION")
    print("=" * 60)

    print("\n[1/7] Testing Frontend Vite Server (port 3000)...")
    async with httpx.AsyncClient(timeout=5.0) as client:
        fe_resp = await client.get("http://localhost:3000/")
        assert fe_resp.status_code == 200, f"Frontend status: {fe_resp.status_code}"
        print("  [PASS] Frontend Vite server is serving HTML at http://localhost:3000/")

    print("\n[2/7] Testing Backend Health & Endpoints (port 8000)...")
    async with httpx.AsyncClient(base_url="http://localhost:8000", timeout=5.0) as client:
        r = await client.get("/api/v1/health")
        assert r.status_code == 200
        print("  [PASS] Backend health check: OK")

        r = await client.get("/api/v1/incidents")
        assert r.status_code == 200
        incidents = r.json()
        assert len(incidents) > 0
        print(f"  [PASS] Seeded incidents fetched: {len(incidents)} active incidents")

        r = await client.get("/api/v1/resources")
        assert r.status_code == 200
        resources = r.json()
        assert len(resources) > 0
        print(f"  [PASS] Seeded resources fetched: {len(resources)} emergency units")

        print("\n[3/7] Testing Smart AI Dispatch Recommendations...")
        inc_id = incidents[0]["id"]
        r = await client.get(f"/api/v1/dispatch/recommendations?incidentId={inc_id}")
        assert r.status_code == 200
        recs = r.json()
        assert len(recs) > 0
        print(f"  [PASS] AI Recommendations: {len(recs)} ranked candidates for Incident #{inc_id}")
        top = recs[0]
        print(f"         Top Unit: [{top['identifier']}] {top['name']} ({top['type']}) | Score: {top['score']}")

        print("\n[4/7] Testing Direct Unit Dispatch...")
        unit_id = recs[0]["resource_id"]
        r = await client.post("/api/v1/dispatch", json={
            "incidentId": str(inc_id),
            "unitId": str(unit_id),
            "dispatchNotes": "E2E Test Dispatch from Command HQ"
        })
        assert r.status_code == 200
        disp = r.json()
        assert disp["success"] is True
        print(f"  [PASS] Direct Dispatch: Unit #{unit_id} dispatched to Incident #{inc_id} (ETA: {disp['etaMinutes']} min)")

        print("\n[5/7] Testing Citizen SOS Report Ingestion & AI Triage...")
        r = await client.post("/api/v1/incidents/reports/submit", json={
            "raw_text": "Severe chemical leak with toxic fumes spreading near MIDC Gate 2",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "source": "citizen_web",
            "reporter_contact": "+91 98200 99887"
        })
        assert r.status_code == 201
        rep = r.json()
        print(f"  [PASS] Citizen Report Ingestion: Report #{rep['id']} created and clustered into Incident #{rep['incident_id']}")

        print("\n[6/7] Testing Unified Dashboard Analytics...")
        r = await client.get("/api/v1/analytics")
        assert r.status_code == 200
        an = r.json()
        assert "totalIncidents" in an and "severityDistribution" in an
        print(f"  [PASS] Unified Analytics: Total Incidents={an['totalIncidents']}, Active={an['activeIncidents']}, Available Units={an['availableUnits']}")

    print("\n[7/7] Testing Real-Time WebSocket Streaming (ws://localhost:8000/ws/hq)...")
    async with websockets.connect("ws://localhost:8000/ws/hq") as ws:
        msg = await ws.recv()
        data = json.loads(msg)
        assert data.get("event") == "connection_established"
        print(f"  [PASS] WebSocket Connected: {data['message']}")

    print("\n" + "=" * 60)
    print(">>> ALL 7 FULL-STACK INTEGRATION CHECKS PASSED! <<<")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_all())
