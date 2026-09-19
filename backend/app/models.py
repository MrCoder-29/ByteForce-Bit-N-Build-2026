from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    emergency_type = Column(String(50), nullable=False, default="General") # Fire, Medical, Flood, HAZMAT, Road, etc.
    severity = Column(String(20), nullable=False, default="Medium") # Critical, High, Medium, Low
    status = Column(String(30), nullable=False, default="Reported") # Reported, Triaged, Dispatched, On Scene, Resolved
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), nullable=True)
    
    # JSON list of required capability strings (e.g. ["Water Rescue", "ALS"])
    required_capabilities = Column(JSON, default=list)
    # JSON list of associated report IDs (clustered duplicate pings)
    report_ids = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # SLA & Escalation
    is_escalated = Column(Boolean, default=False, nullable=False)
    escalated_at = Column(DateTime, nullable=True)
    
    # AI Tactical Outputs
    sitrep_summary = Column(Text, nullable=True)
    sop_guidelines = Column(JSON, default=list)

    # Relationships
    assignments = relationship("DispatchAssignment", back_populates="incident", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="incident")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    source = Column(String(50), nullable=False, default="citizen_web") # citizen_web, emergency_call, iot_sensor, responder
    reporter_name = Column(String(100), nullable=True)
    reporter_contact = Column(String(50), nullable=True)
    raw_text = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    media_url = Column(String(255), nullable=True)
    audio_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(30), nullable=False, default="Raw") # Raw, Clustered, Ignored

    incident = relationship("Incident", back_populates="reports")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    identifier = Column(String(50), unique=True, index=True, nullable=False) # e.g. AMB-101, BOAT-04
    name = Column(String(100), nullable=False) # e.g. Medic Unit 1
    type = Column(String(50), nullable=False) # Ambulance, Fire Truck, Police Patrol, Rescue Boat, Hospital, Hazmat Unit
    capabilities = Column(JSON, default=list) # e.g. ["ALS", "Patient Transport"]
    status = Column(String(30), nullable=False, default="Available") # Available, Dispatched, On Scene, Maintenance, Offline
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=True) # ICU beds or responder personnel count
    contact_number = Column(String(50), nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    assignments = relationship("DispatchAssignment", back_populates="resource")


class DispatchAssignment(Base):
    __tablename__ = "dispatch_assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(30), nullable=False, default="Assigned") # Assigned, En Route, On Scene, Completed, Cancelled
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    arrived_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    score = Column(Float, default=0.0)
    estimated_eta_minutes = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)

    incident = relationship("Incident", back_populates="assignments")
    resource = relationship("Resource", back_populates="assignments")
