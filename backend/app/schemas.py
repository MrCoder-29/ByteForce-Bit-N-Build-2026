from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

# --- REPORT SCHEMAS ---
class ReportBase(BaseModel):
    raw_text: str
    latitude: float
    longitude: float
    source: str = "citizen_web"
    reporter_name: Optional[str] = None
    reporter_contact: Optional[str] = None
    media_url: Optional[str] = None
    audio_url: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    incident_id: Optional[int] = None
    created_at: datetime
    status: str

    class Config:
        from_attributes = True


# --- INCIDENT SCHEMAS ---
class IncidentBase(BaseModel):
    title: str
    description: Optional[str] = None
    emergency_type: str = "General"
    severity: str = "Medium" # Critical, High, Medium, Low
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    required_capabilities: List[str] = Field(default_factory=list)

class IncidentCreate(IncidentBase):
    report_ids: Optional[List[int]] = Field(default_factory=list)

class IncidentUpdateStatus(BaseModel):
    status: str # Reported, Triaged, Dispatched, On Scene, Resolved
    sitrep_summary: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: int
    status: str
    report_ids: List[int] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    is_escalated: bool
    escalated_at: Optional[datetime] = None
    sitrep_summary: Optional[str] = None
    sop_guidelines: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True


# --- RESOURCE SCHEMAS ---
class ResourceBase(BaseModel):
    identifier: str
    name: str
    type: str
    capabilities: List[str] = Field(default_factory=list)
    latitude: float
    longitude: float
    capacity: Optional[int] = None
    contact_number: Optional[str] = None

class ResourceCreate(ResourceBase):
    status: str = "Available"

class ResourceUpdateStatus(BaseModel):
    status: str # Available, Dispatched, On Scene, Maintenance, Offline
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ResourceResponse(ResourceBase):
    id: int
    status: str
    last_updated: datetime

    class Config:
        from_attributes = True


# --- RESOURCE MATCHING & RECOMMENDATION SCHEMAS ---
class ResourceRecommendation(BaseModel):
    resource_id: int
    identifier: str
    name: str
    type: str
    capabilities: List[str]
    status: str
    latitude: float
    longitude: float
    distance_km: float
    capability_match_score: float
    availability_score: float
    score: float
    estimated_eta_minutes: float


# --- DISPATCH SCHEMAS ---
class DispatchCreate(BaseModel):
    resource_id: int
    notes: Optional[str] = None

class DispatchAssignmentResponse(BaseModel):
    id: int
    incident_id: int
    resource_id: int
    status: str
    assigned_at: datetime
    arrived_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    score: float
    estimated_eta_minutes: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True


# --- ANALYTICS SCHEMAS ---
class AnalyticsOverview(BaseModel):
    total_incidents: int
    active_incidents: int
    resolved_incidents: int
    total_resources: int
    available_resources: int
    dispatched_resources: int
    active_dispatches: int
    escalated_incidents_count: int

class AnalyticsCategoryCount(BaseModel):
    category: str
    count: int

class AnalyticsSeverityDistribution(BaseModel):
    critical: int
    high: int
    medium: int
    low: int

class AnalyticsResponseTime(BaseModel):
    avg_dispatch_time_seconds: float
    avg_on_scene_time_seconds: float

class AnalyticsResourceUtilization(BaseModel):
    type: str
    total: int
    available: int
    dispatched: int
    utilization_rate: float
