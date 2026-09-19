from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Incident, Report, DispatchAssignment, Resource
from app.schemas import (
    IncidentCreate, IncidentResponse, IncidentUpdateStatus,
    ReportCreate, ReportResponse
)
from app.ai_interface import ai_interface
from app.websocket_manager import manager as ws_manager

router = APIRouter(prefix="/incidents", tags=["Incidents & Reports"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    status: Optional[str] = Query(None, description="Filter by status (Reported, Triaged, Dispatched, On Scene, Resolved)"),
    severity: Optional[str] = Query(None, description="Filter by severity (Critical, High, Medium, Low)"),
    emergency_type: Optional[str] = Query(None, description="Filter by type (Fire, Medical, Flood, HAZMAT, Road)"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieve all incidents with optional filtering."""
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    if emergency_type:
        query = query.filter(Incident.emergency_type == emergency_type)
    
    incidents = query.order_by(Incident.created_at.desc()).limit(limit).all()
    return incidents


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    """Get single incident by ID."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident #{incident_id} not found")
    return incident


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    """Create a new incident and trigger AI triage classification."""
    # Run AI triage if description provided
    combined_text = f"{payload.title}. {payload.description or ''}"
    ai_result = ai_interface.classify_report(combined_text, payload.latitude, payload.longitude)

    # Use AI recommendations if capabilities/severity not explicitly specified
    final_type = payload.emergency_type if payload.emergency_type != "General" else ai_result["emergency_type"]
    final_severity = payload.severity if payload.severity != "Medium" else ai_result["severity"]
    final_caps = payload.required_capabilities or ai_result["required_capabilities"]
    sop = ai_result.get("sop_guidelines", [])

    incident = Incident(
        title=payload.title,
        description=payload.description,
        emergency_type=final_type,
        severity=final_severity,
        status="Triaged" if final_type else "Reported",
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_name=payload.location_name,
        required_capabilities=final_caps,
        report_ids=payload.report_ids or [],
        sop_guidelines=sop,
        sitrep_summary=ai_interface.generate_sitrep(payload.title, final_type, final_severity, len(payload.report_ids or []))
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Broadcast WebSocket Event
    await ws_manager.broadcast("incident_created", {
        "id": incident.id,
        "title": incident.title,
        "emergency_type": incident.emergency_type,
        "severity": incident.severity,
        "status": incident.status,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "required_capabilities": incident.required_capabilities,
        "created_at": incident.created_at.isoformat()
    })

    return incident


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: int, 
    payload: IncidentUpdateStatus, 
    db: Session = Depends(get_db)
):
    """
    Update incident lifecycle status (Reported -> Triaged -> Dispatched -> On Scene -> Resolved).
    Releases assigned resources when resolved.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident #{incident_id} not found")

    old_status = incident.status
    incident.status = payload.status
    incident.updated_at = datetime.utcnow()
    if payload.sitrep_summary:
        incident.sitrep_summary = payload.sitrep_summary

    # If resolving incident, update assigned resources back to Available
    if payload.status == "Resolved":
        assignments = db.query(DispatchAssignment).filter(
            DispatchAssignment.incident_id == incident_id,
            DispatchAssignment.status.in_(["Assigned", "En Route", "On Scene"])
        ).all()

        for assign in assignments:
            assign.status = "Completed"
            assign.completed_at = datetime.utcnow()
            
            # Free resource
            res = db.query(Resource).filter(Resource.id == assign.resource_id).first()
            if res:
                res.status = "Available"
                res.last_updated = datetime.utcnow()

    db.commit()
    db.refresh(incident)

    # Broadcast WebSocket Event
    await ws_manager.broadcast("incident_updated", {
        "id": incident.id,
        "title": incident.title,
        "old_status": old_status,
        "new_status": incident.status,
        "updated_at": incident.updated_at.isoformat()
    })

    return incident


# --- CITIZEN REPORT ENDPOINTS ---
@router.post("/reports/submit", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_citizen_report(payload: ReportCreate, db: Session = Depends(get_db)):
    """
    Citizen web report ingestion endpoint (Member 4 integration).
    Auto-creates or clusters into an active incident.
    """
    report = Report(
        raw_text=payload.raw_text,
        latitude=payload.latitude,
        longitude=payload.longitude,
        source=payload.source,
        reporter_name=payload.reporter_name,
        reporter_contact=payload.reporter_contact,
        media_url=payload.media_url,
        audio_url=payload.audio_url,
        status="Raw"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # AI Triage & Auto-incident creation
    ai_class = ai_interface.classify_report(payload.raw_text, payload.latitude, payload.longitude)
    
    incident = Incident(
        title=ai_class["title"],
        description=payload.raw_text,
        emergency_type=ai_class["emergency_type"],
        severity=ai_class["severity"],
        status="Triaged",
        latitude=payload.latitude,
        longitude=payload.longitude,
        required_capabilities=ai_class["required_capabilities"],
        report_ids=[report.id],
        sop_guidelines=ai_class.get("sop_guidelines", [])
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    report.incident_id = incident.id
    report.status = "Clustered"
    db.commit()

    # Broadcast WebSocket Event
    await ws_manager.broadcast("incident_created", {
        "id": incident.id,
        "title": incident.title,
        "emergency_type": incident.emergency_type,
        "severity": incident.severity,
        "status": incident.status,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "source": payload.source,
        "created_at": incident.created_at.isoformat()
    })

    return report
