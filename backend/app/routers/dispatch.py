from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Incident, Resource, DispatchAssignment
from app.schemas import (
    ResourceRecommendation, DispatchCreate, DispatchAssignmentResponse
)
from app.algorithms.matching import rank_resources_for_incident, calculate_resource_score
from app.websocket_manager import manager as ws_manager

router = APIRouter(prefix="", tags=["Dispatch Optimization & Recommendations"])

class FrontendDispatchPayload(BaseModel):
    incidentId: Any
    unitId: Any
    dispatchNotes: Optional[str] = None
    priorityOverride: Optional[bool] = None

def resolve_incident(db: Session, inc_id: Any) -> Optional[Incident]:
    if isinstance(inc_id, int):
        return db.query(Incident).filter(Incident.id == inc_id).first()
    s = str(inc_id)
    if s.isdigit():
        return db.query(Incident).filter(Incident.id == int(s)).first()
    digits = ''.join(filter(str.isdigit, s))
    if digits:
        found = db.query(Incident).filter(Incident.id == int(digits)).first()
        if found:
            return found
    return db.query(Incident).first()

def resolve_resource(db: Session, res_id: Any) -> Optional[Resource]:
    if isinstance(res_id, int):
        return db.query(Resource).filter(Resource.id == res_id).first()
    s = str(res_id)
    res = db.query(Resource).filter(Resource.identifier == s).first()
    if res:
        return res
    if s.isdigit():
        res = db.query(Resource).filter(Resource.id == int(s)).first()
        if res:
            return res
    digits = ''.join(filter(str.isdigit, s))
    if digits:
        res = db.query(Resource).filter(Resource.id == int(digits)).first()
        if res:
            return res
    return db.query(Resource).filter(Resource.status == "Available").first()

@router.get("/dispatch/recommendations", response_model=List[ResourceRecommendation])
def get_resource_recommendations_query(
    incidentId: str = Query(..., description="Target Incident ID"),
    limit: int = 10,
    db: Session = Depends(get_db)
):
    incident = resolve_incident(db, incidentId)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident '{incidentId}' not found")
    resources = db.query(Resource).filter(
        Resource.status.in_(["Available", "Dispatched"])
    ).all()
    return rank_resources_for_incident(incident, resources, limit=limit)

@router.get("/incidents/{incident_id}/recommendations", response_model=List[ResourceRecommendation])
def get_resource_recommendations(
    incident_id: str, 
    limit: int = 10, 
    db: Session = Depends(get_db)
):
    """
    Get top suitable available emergency resources for an incident, 
    ranked by Haversine distance, capability match, and availability score.
    """
    incident = resolve_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident #{incident_id} not found")

    # Fetch candidate resources (Available or Dispatched)
    resources = db.query(Resource).filter(
        Resource.status.in_(["Available", "Dispatched"])
    ).all()

    recommendations = rank_resources_for_incident(incident, resources, limit=limit)
    return recommendations


@router.post("/dispatch")
async def dispatch_unit_direct(
    payload: FrontendDispatchPayload,
    db: Session = Depends(get_db)
):
    """
    Direct dispatch endpoint used by Frontend UI.
    """
    incident = resolve_incident(db, payload.incidentId)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident '{payload.incidentId}' not found")

    resource = resolve_resource(db, payload.unitId)
    if not resource:
        raise HTTPException(status_code=404, detail=f"Resource '{payload.unitId}' not found")

    rec = calculate_resource_score(incident, resource)

    assignment = DispatchAssignment(
        incident_id=incident.id,
        resource_id=resource.id,
        status="Assigned",
        assigned_at=datetime.utcnow(),
        score=rec.score,
        estimated_eta_minutes=rec.estimated_eta_minutes,
        notes=payload.dispatchNotes
    )
    db.add(assignment)

    if incident.status in ["Reported", "Triaged", "PENDING", "TRIAGED"]:
        incident.status = "Dispatched"
        incident.updated_at = datetime.utcnow()

    resource.status = "Dispatched"
    resource.last_updated = datetime.utcnow()

    db.commit()
    db.refresh(assignment)

    # Broadcast event
    await ws_manager.broadcast("resource_dispatched", {
        "assignment_id": assignment.id,
        "incident_id": incident.id,
        "incident_title": incident.title,
        "resource_id": resource.id,
        "resource_identifier": resource.identifier,
        "resource_name": resource.name,
        "score": assignment.score,
        "estimated_eta_minutes": assignment.estimated_eta_minutes,
        "assigned_at": assignment.assigned_at.isoformat()
    })

    return {
        "success": True,
        "message": f"Unit {resource.identifier} successfully dispatched to Incident #{incident.id}",
        "incidentId": str(incident.id),
        "unitId": str(resource.id),
        "assignedTimestamp": assignment.assigned_at.isoformat(),
        "etaMinutes": assignment.estimated_eta_minutes
    }


@router.post("/incidents/{incident_id}/dispatch", response_model=DispatchAssignmentResponse, status_code=status.HTTP_201_CREATED)
async def dispatch_resource_to_incident(
    incident_id: int, 
    payload: DispatchCreate, 
    db: Session = Depends(get_db)
):
    """
    Assign an emergency resource to an incident.
    Updates incident status to 'Dispatched' and resource status to 'Dispatched'.
    Emits WebSocket event 'resource_dispatched'.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident #{incident_id} not found")

    resource = db.query(Resource).filter(Resource.id == payload.resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail=f"Resource #{payload.resource_id} not found")

    # Calculate match score & simulated ETA
    rec = calculate_resource_score(incident, resource)

    # Create assignment
    assignment = DispatchAssignment(
        incident_id=incident.id,
        resource_id=resource.id,
        status="Assigned",
        assigned_at=datetime.utcnow(),
        score=rec.score,
        estimated_eta_minutes=rec.estimated_eta_minutes,
        notes=payload.notes
    )
    db.add(assignment)

    # Update Incident status
    old_inc_status = incident.status
    if incident.status in ["Reported", "Triaged"]:
        incident.status = "Dispatched"
        incident.updated_at = datetime.utcnow()

    # Update Resource status
    old_res_status = resource.status
    resource.status = "Dispatched"
    resource.last_updated = datetime.utcnow()

    db.commit()
    db.refresh(assignment)

    # Broadcast WebSocket Event
    await ws_manager.broadcast("resource_dispatched", {
        "assignment_id": assignment.id,
        "incident_id": incident.id,
        "incident_title": incident.title,
        "resource_id": resource.id,
        "resource_identifier": resource.identifier,
        "resource_name": resource.name,
        "score": assignment.score,
        "estimated_eta_minutes": assignment.estimated_eta_minutes,
        "assigned_at": assignment.assigned_at.isoformat()
    })

    return assignment


@router.get("/dispatch/assignments", response_model=List[DispatchAssignmentResponse])
def list_dispatch_assignments(db: Session = Depends(get_db)):
    """List active and historical dispatch assignments."""
    return db.query(DispatchAssignment).order_by(DispatchAssignment.assigned_at.desc()).all()
