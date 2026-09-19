#!/usr/bin/env python3
"""
ByteForce - PS-9: Intelligent Emergency Response Platform
Member 4: Standalone Scenario & Sensor Event Simulator CLI

Generates deterministic multi-source emergency incident streams (911 transcripts,
citizen mobile pings, and IoT environmental sensor telemetry).

Usage:
  python scenario_simulator.py --scenario chemical_fire
  python scenario_simulator.py --scenario flash_flood
  python scenario_simulator.py --scenario highway_collision
  python scenario_simulator.py --scenario all --dry-run
"""

import argparse
import json
import time
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

SCENARIOS = {
    "chemical_fire": {
        "name": "Scenario A: 5-Alarm Industrial Chemical Fire",
        "category": "HAZMAT / Industrial Fire",
        "severity": 5,
        "description": "Multi-tank rupture with toxic solvent explosion at chemical storage terminal.",
        "events": [
            {
                "source": "911_CALL_AUDIO",
                "category": "hazmat_fire",
                "severity": 5,
                "title": "911 Audio Dispatch - Plant Security",
                "description": "Plant security calling! Major tank rupture at Storage Tank 7. Volatile solvent caught fire. Heavy black smoke and sulfur smell. Workers evacuating towards East Gate.",
                "transcript": "911 What's your emergency? — Security guard here, Tank 7 blew up! Fire is spreading toward the chlorine tanks! We need fire and hazmat immediately!",
                "reporter_name": "Gatehouse Officer 4",
                "phone": "+1-555-019-4821",
                "location": {
                    "address": "Apex Petrochem Complex, Dock 14, Industrial Zone",
                    "latitude": 40.7128,
                    "longitude": -74.0060
                },
                "estimated_casualties": 3,
                "required_capabilities": ["Level-B SCBA", "Class-B Foam", "Atmospheric Analyzer"]
            },
            {
                "source": "CITIZEN_WEB",
                "category": "fire",
                "severity": 4,
                "title": "Citizen Report #1 (Passing Driver)",
                "description": "Driving down River Road, just saw massive fireball and black cloud from chemical factory. Hard to breathe with windows down.",
                "reporter_name": "Marcus Vance",
                "phone": "+1-555-012-9988",
                "location": {
                    "address": "River Road (200m from Apex Petrochem)",
                    "latitude": 40.7134,
                    "longitude": -74.0055
                },
                "estimated_casualties": 0
            },
            {
                "source": "CITIZEN_WEB",
                "category": "hazmat",
                "severity": 5,
                "title": "Citizen Report #2 (Adjacent Facility Worker)",
                "description": "Loud explosion next door at Petrochem. Alarms sounding across the entire park. Chemical sulfur smell.",
                "reporter_name": "Sarah Lin",
                "phone": "+1-555-018-3312",
                "location": {
                    "address": "Adjacent Logistics Hub B",
                    "latitude": 40.7122,
                    "longitude": -74.0068
                },
                "estimated_casualties": 1
            },
            {
                "source": "IOT_SENSOR",
                "category": "sensor_alert",
                "sensor_id": "SNS-GAS-04",
                "sensor_type": "Volatile Organic Compound / Ammonia Detector",
                "metric_name": "Toxic Gas Concentration (PPM)",
                "value": "480 PPM",
                "threshold": "50 PPM",
                "is_anomaly": True,
                "location": {
                    "address": "Industrial Zone Sensor Mast #4",
                    "latitude": 40.7125,
                    "longitude": -74.0062
                }
            }
        ]
    },

    "flash_flood": {
        "name": "Scenario B: Flash Flood Sensor Alert & Stranded Motorists",
        "category": "Flood / Water Rescue",
        "severity": 4,
        "description": "Culvert water level surge exceeding safety threshold with stranded motorists.",
        "events": [
            {
                "source": "IOT_SENSOR",
                "category": "sensor_alert",
                "sensor_id": "SNS-FLD-01",
                "sensor_type": "Ultrasonic Culvert Water Level Gauge",
                "metric_name": "Water Depth Above Roadway",
                "value": "4.2 Meters",
                "threshold": "2.0 Meters",
                "is_anomaly": True,
                "location": {
                    "address": "5th Street Underpass Culvert",
                    "latitude": 40.7305,
                    "longitude": -73.9925
                }
            },
            {
                "source": "CITIZEN_WEB",
                "category": "flood",
                "severity": 4,
                "title": "Citizen Report #1 (Stranded Driver)",
                "description": "Water rose to hood level in 3 minutes under the bridge! 2 cars stuck with elderly driver inside one.",
                "reporter_name": "David K.",
                "phone": "+1-555-014-7744",
                "location": {
                    "address": "5th St Viaduct Entrance",
                    "latitude": 40.7308,
                    "longitude": -73.9920
                },
                "estimated_casualties": 2,
                "required_capabilities": ["Swift-Water Rescue Boat", "PFD Flotation Gear"]
            },
            {
                "source": "CITIZEN_WEB",
                "category": "flood",
                "severity": 4,
                "title": "Citizen Report #2 (Pedestrian)",
                "description": "Torrential current sweeping debris across road. People standing on car roofs waiting for help.",
                "reporter_name": "Elena Rostova",
                "phone": "+1-555-019-1120",
                "location": {
                    "address": "5th & Elm Pedestrian Walk",
                    "latitude": 40.7302,
                    "longitude": -73.9930
                },
                "estimated_casualties": 3
            }
        ]
    },

    "highway_collision": {
        "name": "Scenario C: Road Collision on Highway (Multi-Vehicle Pileup)",
        "category": "Transportation / Medical Rescue",
        "severity": 5,
        "description": "Multi-car and commercial tanker collision with entrapped victims and fuel leak.",
        "events": [
            {
                "source": "CITIZEN_WEB",
                "category": "crash",
                "severity": 5,
                "title": "Citizen Emergency Report (Passing Motorist)",
                "description": "Horrible pileup right before Exit 8! Tanker jackknifed across two lanes, SUV crushed underneath. People trapped inside.",
                "reporter_name": "Jason Reed",
                "phone": "+1-555-016-6632",
                "location": {
                    "address": "Interstate Highway 95 North, Mile Marker 42.5",
                    "latitude": 40.7450,
                    "longitude": -73.9800
                },
                "estimated_casualties": 2,
                "required_capabilities": ["Hydraulic Extrication Cutters", "Trauma ALS Medic", "Fuel Absorbent Wash"]
            },
            {
                "source": "CITIZEN_WEB",
                "category": "crash",
                "severity": 4,
                "title": "Citizen Emergency Report (Truck Driver)",
                "description": "Fuel leaking onto pavement from ruptured saddle tank. Need fire crew with hydraulic cutters immediately.",
                "reporter_name": "Bill Thornton",
                "phone": "+1-555-017-4491",
                "location": {
                    "address": "I-95 Northbound Mile 42.6",
                    "latitude": 40.7455,
                    "longitude": -73.9795
                },
                "estimated_casualties": 1
            }
        ]
    }
}


def send_payload(url: str, payload: dict, dry_run: bool = False) -> bool:
    payload["timestamp"] = datetime.now(timezone.utc).isoformat()
    raw_json = json.dumps(payload, indent=2)

    if dry_run:
        print(f"\n[DRY RUN] Would POST to {url}:\n{raw_json}")
        return True

    try:
        req = urllib.request.Request(
            url,
            data=raw_json.encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            status = resp.status
            body = resp.read().decode("utf-8")
            print(f"  [OK {status}] Sent to {url} -> {body[:100]}")
            return True
    except urllib.error.URLError as e:
        print(f"  [OFFLINE / NOT RUNNING] Could not reach {url}: {e.reason}")
        print("  (Falling back to local simulation mode)")
        return False
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False


def run_scenario(key: str, incident_url: str, sensor_url: str, delay: float, dry_run: bool):
    scenario = SCENARIOS.get(key)
    if not scenario:
        print(f"Error: Unknown scenario '{key}'. Choose from: {list(SCENARIOS.keys())}")
        return

    print(f"\n=======================================================")
    print(f"[EMERGENCY ALERT] TRIGGERING: {scenario['name']}")
    print(f"Category: {scenario['category']} | Severity: {scenario['severity']}/5")
    print(f"Description: {scenario['description']}")
    print(f"Total Convergent Events: {len(scenario['events'])}")
    print(f"=======================================================\n")

    for idx, event in enumerate(scenario["events"], 1):
        target = sensor_url if event["source"] == "IOT_SENSOR" else incident_url
        print(f"[{idx}/{len(scenario['events'])}] Ingesting {event['source']}: {event.get('title') or event.get('sensor_id')}")
        send_payload(target, event, dry_run=dry_run)
        if idx < len(scenario["events"]):
            time.sleep(delay)

    print(f"\n[OK] Scenario '{key}' dispatch sequence completed successfully.\n")


def main():
    parser = argparse.ArgumentParser(description="ByteForce PS-9 Emergency Scenario Simulator CLI")
    parser.add_argument(
        "--scenario",
        choices=["chemical_fire", "flash_flood", "highway_collision", "all"],
        default="chemical_fire",
        help="Scenario to trigger (default: chemical_fire)"
    )
    parser.add_argument(
        "--incident-url",
        default="http://localhost:8000/api/v1/incidents/report",
        help="Incident ingestion endpoint URL"
    )
    parser.add_argument(
        "--sensor-url",
        default="http://localhost:8000/api/v1/sensors/telemetry",
        help="Sensor telemetry endpoint URL"
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.8,
        help="Delay in seconds between events"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print JSON payloads without sending HTTP requests"
    )

    args = parser.parse_args()

    if args.scenario == "all":
        for sc_key in SCENARIOS.keys():
            run_scenario(sc_key, args.incident_url, args.sensor_url, args.delay, args.dry_run)
            time.sleep(1.0)
    else:
        run_scenario(args.scenario, args.incident_url, args.sensor_url, args.delay, args.dry_run)


if __name__ == "__main__":
    main()
