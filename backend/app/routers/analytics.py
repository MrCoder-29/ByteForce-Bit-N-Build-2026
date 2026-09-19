from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Incident, Resource, DispatchAssignment
from app.schemas import (
    AnalyticsOverview, AnalyticsCategoryCount, AnalyticsSeverityDistribution,
    AnalyticsResponseTime, AnalyticsResourceUtilization
)

router = APIRouter(prefix="/analytics", tags=["Commander Analytics & Operational Metrics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    """Summary KPI metrics for Commander HQ Dashboard."""
    total_incidents = db.query(Incident).count()
    active_incidents = db.query(Incident).filter(Incident.status.in_(["Reported", "Triaged", "Dispatched", "On Scene"])).count()
    resolved_incidents = db.query(Incident).filter(Incident.status == "Resolved").count()
    
    total_resources = db.query(Resource).count()
    available_resources = db.query(Resource).filter(Resource.status == "Available").count()
    dispatched_resources = db.query(Resource).filter(Resource.status == "Dispatched").count()
    active_dispatches = db.query(DispatchAssignment).filter(DispatchAssignment.status.in_(["Assigned", "En Route", "On Scene"])).count()
    
    escalated_count = db.query(Incident).filter(Incident.is_escalated == True).count()

    return AnalyticsOverview(
        total_incidents=total_incidents,
        active_incidents=active_incidents,
        resolved_incidents=resolved_incidents,
        total_resources=total_resources,
        available_resources=available_resources,
        dispatched_resources=dispatched_resources,
        active_dispatches=active_dispatches,
        escalated_incidents_count=escalated_count
    )


@router.get("/incident-counts-by-type", response_model=List[AnalyticsCategoryCount])
def get_incident_counts_by_type(db: Session = Depends(get_db)):
    """Count of incidents grouped by emergency category."""
    results = db.query(Incident.emergency_type, func.count(Incident.id))\
                .group_by(Incident.emergency_type).all()
    
    return [AnalyticsCategoryCount(category=res[0], count=res[1]) for res in results]


@router.get("/severity-distribution", response_model=AnalyticsSeverityDistribution)
def get_severity_distribution(db: Session = Depends(get_db)):
    """Incident distribution by severity level (Critical, High, Medium, Low)."""
    counts = {
        "critical": db.query(Incident).filter(Incident.severity == "Critical").count(),
        "high": db.query(Incident).filter(Incident.severity == "High").count(),
        "medium": db.query(Incident).filter(Incident.severity == "Medium").count(),
        "low": db.query(Incident).filter(Incident.severity == "Low").count()
    }
    return AnalyticsSeverityDistribution(**counts)


@router.get("/average-response-time", response_model=AnalyticsResponseTime)
def get_average_response_time(db: Session = Depends(get_db)):
    """Calculates average latency in seconds from incident creation to unit dispatch & arrival."""
    assignments = db.query(DispatchAssignment).all()
    if not assignments:
        return AnalyticsResponseTime(avg_dispatch_time_seconds=0.0, avg_on_scene_time_seconds=0.0)

    dispatch_delays = []
    on_scene_delays = []

    for assign in assignments:
        inc = db.query(Incident).filter(Incident.id == assign.incident_id).first()
        if inc:
            dispatch_delay = (assign.assigned_at - inc.created_at).total_seconds()
            dispatch_delays.append(max(0.0, dispatch_delay))

            if assign.arrived_at:
                scene_delay = (assign.arrived_at - inc.created_at).total_seconds()
                on_scene_delays.append(max(0.0, scene_delay))

    avg_dispatch = sum(dispatch_delays) / len(dispatch_delays) if dispatch_delays else 0.0
    avg_scene = sum(on_scene_delays) / len(on_scene_delays) if on_scene_delays else avg_dispatch + 180.0

    return AnalyticsResponseTime(
        avg_dispatch_time_seconds=round(avg_dispatch, 1),
        avg_on_scene_time_seconds=round(avg_scene, 1)
    )


@router.get("/resource-utilization", response_model=List[AnalyticsResourceUtilization])
def get_resource_utilization(db: Session = Depends(get_db)):
    """Returns resource deployment and availability percentages by unit type."""
    types = db.query(Resource.type).distinct().all()
    output = []
    
    for (res_type,) in types:
        total = db.query(Resource).filter(Resource.type == res_type).count()
        available = db.query(Resource).filter(Resource.type == res_type, Resource.status == "Available").count()
        dispatched = db.query(Resource).filter(Resource.type == res_type, Resource.status == "Dispatched").count()
        util_rate = (dispatched / total * 100.0) if total > 0 else 0.0

        output.append(AnalyticsResourceUtilization(
            type=res_type,
            total=total,
            available=available,
            dispatched=dispatched,
            utilization_rate=round(util_rate, 1)
        ))

    return output


@router.get("/resource-shortages")
def get_resource_shortages(db: Session = Depends(get_db)):
    """Identifies required capabilities that currently have zero available units."""
    active_incidents = db.query(Incident).filter(
        Incident.status.in_(["Reported", "Triaged"])
    ).all()

    required_caps = set()
    for inc in active_incidents:
        if inc.required_capabilities:
            required_caps.update(inc.required_capabilities)

    available_resources = db.query(Resource).filter(Resource.status == "Available").all()
    available_caps = set()
    for res in available_resources:
        if res.capabilities:
            available_caps.update(res.capabilities)

    shortages = list(required_caps - available_caps)
    return {
        "shortage_count": len(shortages),
        "unmet_capabilities": shortages,
        "message": "Resource deficit detected!" if shortages else "All active capability requirements are covered."
    }
