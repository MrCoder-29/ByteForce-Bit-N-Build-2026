from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Incident, Report
from app.ai_interface import ai_interface
from app.websocket_manager import manager as ws_manager
from app.config import settings

router = APIRouter(prefix="/simulation", tags=["Demo Scenario Simulator (Member 4 Integration)"])

class ScenarioTriggerPayload(BaseModel):
    scenario_code: str # A, B, C, or custom
    latitude: Optional[float] = None
    longitude: Optional[float] = None

SCENARIO_PRESETS = {
    "A": {
        "title": "5-Alarm Chemical Plant Explosion & Fire",
        "description": "Massive explosion reported at Industrial Sector 4. Dense toxic smoke plume rising. Multiple worker injuries and chemical containment breach.",
        "emergency_type": "HAZMAT",
        "severity": "Critical",
        "required_capabilities": ["Hazmat", "Hazmat Isolation", "Fire Suppression", "Advanced Life Support", "Decontamination"],
        "offset_lat": 0.010,
        "offset_lon": -0.012
    },
    "B": {
        "title": "Severe River Flash Flood & Stranded Vehicles",
        "description": "Rapidly rising water levels trapping citizens in vehicles near Bay Highway Bridge. Water rescue boats and divers urgently needed.",
        "emergency_type": "Flood",
        "severity": "Critical",
        "required_capabilities": ["Water Rescue", "Flood Support", "Diver Unit", "Patient Transport"],
        "offset_lat": 0.022,
        "offset_lon": 0.028
    },
    "C": {
        "title": "Highway Multi-Vehicle Pileup Crash",
        "description": "7-vehicle collision on Interstate 80. Fuel spill, 2 victims trapped inside crushed sedan.",
        "emergency_type": "Road Accident",
        "severity": "High",
        "required_capabilities": ["Extrication", "Traffic Control", "Advanced Life Support", "Patient Transport"],
        "offset_lat": -0.015,
        "offset_lon": -0.005
    }
}

@router.post("/trigger-scenario", status_code=status.HTTP_201_CREATED)
async def trigger_emergency_scenario(payload: ScenarioTriggerPayload, db: Session = Depends(get_db)):
    """
    Triggers live synthetic emergency disaster scenario for demonstration.
    Injects master incident + duplicate citizen pings and broadcasts WebSocket events.
    """
    preset = SCENARIO_PRESETS.get(payload.scenario_code.upper())
    if not preset:
        raise HTTPException(status_code=400, detail=f"Invalid scenario code '{payload.scenario_code}'. Supported: A, B, C")

    lat = payload.latitude if payload.latitude is not None else (settings.DEFAULT_CENTER_LAT + preset["offset_lat"])
    lon = payload.longitude if payload.longitude is not None else (settings.DEFAULT_CENTER_LON + preset["offset_lon"])

    # 1. Create duplicate citizen reports first
    report_1 = Report(
        raw_text=f"EMERGENCY CALL: {preset['description']}",
        latitude=lat + 0.0001,
        longitude=lon - 0.0001,
        source="emergency_call",
        status="Clustered"
    )
    report_2 = Report(
        raw_text=f"Citizen app ping: Big emergency seen at {preset['title']}",
        latitude=lat - 0.0002,
        longitude=lon + 0.0001,
        source="citizen_web",
        status="Clustered"
    )
    db.add(report_1)
    db.add(report_2)
    db.commit()
    db.refresh(report_1)
    db.refresh(report_2)

    # 2. Create Master Incident
    sop = [
        f"Deploy primary {preset['emergency_type']} response taskforce.",
        f"Equip responders with capabilities: {', '.join(preset['required_capabilities'])}.",
        "Isolate 300m safety perimeter immediately."
    ]

    incident = Incident(
        title=preset["title"],
        description=preset["description"],
        emergency_type=preset["emergency_type"],
        severity=preset["severity"],
        status="Triaged",
        latitude=lat,
        longitude=lon,
        location_name=f"Sector ({round(lat, 4)}, {round(lon, 4)})",
        required_capabilities=preset["required_capabilities"],
        report_ids=[report_1.id, report_2.id],
        sop_guidelines=sop,
        sitrep_summary=f"DEMO SCENARIO TRIGGERED: {preset['severity']} {preset['emergency_type']} - {preset['title']}."
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Link reports to incident
    report_1.incident_id = incident.id
    report_2.incident_id = incident.id
    db.commit()

    # Broadcast WebSocket event
    await ws_manager.broadcast("incident_created", {
        "id": incident.id,
        "title": incident.title,
        "emergency_type": incident.emergency_type,
        "severity": incident.severity,
        "status": incident.status,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "scenario_code": payload.scenario_code,
        "duplicate_reports_merged": 2,
        "created_at": incident.created_at.isoformat()
    })

    return {
        "message": f"Scenario {payload.scenario_code} successfully triggered.",
        "incident": {
            "id": incident.id,
            "title": incident.title,
            "emergency_type": incident.emergency_type,
            "severity": incident.severity,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "reports_clustered": [report_1.id, report_2.id]
        }
    }
