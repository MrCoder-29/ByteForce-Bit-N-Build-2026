from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resource
from app.schemas import ResourceCreate, ResourceResponse, ResourceUpdateStatus
from app.websocket_manager import manager as ws_manager

router = APIRouter(prefix="/resources", tags=["Emergency Resources"])

@router.get("", response_model=List[ResourceResponse])
def get_resources(
    type: Optional[str] = Query(None, description="Filter by resource type (Ambulance, Fire Truck, Police Patrol, Rescue Boat, Hospital)"),
    status: Optional[str] = Query(None, description="Filter by status (Available, Dispatched, On Scene, Offline)"),
    db: Session = Depends(get_db)
):
    """Get list of emergency units and facilities."""
    query = db.query(Resource)
    if type:
        query = query.filter(Resource.type == type)
    if status:
        query = query.filter(Resource.status == status)

    return query.order_by(Resource.identifier.asc()).all()


@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    """Get single resource by ID."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail=f"Resource #{resource_id} not found")
    return resource


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(payload: ResourceCreate, db: Session = Depends(get_db)):
    """Register a new emergency response unit or hospital."""
    existing = db.query(Resource).filter(Resource.identifier == payload.identifier).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Resource identifier '{payload.identifier}' already registered.")

    resource = Resource(
        identifier=payload.identifier,
        name=payload.name,
        type=payload.type,
        capabilities=payload.capabilities,
        status=payload.status,
        latitude=payload.latitude,
        longitude=payload.longitude,
        capacity=payload.capacity,
        contact_number=payload.contact_number
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


@router.patch("/{resource_id}/status", response_model=ResourceResponse)
async def update_resource_status(
    resource_id: int, 
    payload: ResourceUpdateStatus, 
    db: Session = Depends(get_db)
):
    """
    Update responder status and live GPS coordinates.
    Emits WebSocket event `responder_status_changed`.
    """
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail=f"Resource #{resource_id} not found")

    old_status = resource.status
    resource.status = payload.status
    if payload.latitude is not None:
        resource.latitude = payload.latitude
    if payload.longitude is not None:
        resource.longitude = payload.longitude
    resource.last_updated = datetime.utcnow()

    db.commit()
    db.refresh(resource)

    # Broadcast WebSocket Event
    await ws_manager.broadcast("responder_status_changed", {
        "resource_id": resource.id,
        "identifier": resource.identifier,
        "name": resource.name,
        "old_status": old_status,
        "new_status": resource.status,
        "latitude": resource.latitude,
        "longitude": resource.longitude,
        "updated_at": resource.last_updated.isoformat()
    })

    return resource
