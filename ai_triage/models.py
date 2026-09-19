"""
Data models and contracts for AI Engine & Triage module.
Provides Pydantic BaseModel schemas with dataclass fallbacks for maximum compatibility.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

try:
    from pydantic import BaseModel, Field  # type: ignore
    PYDANTIC_AVAILABLE = True
except ImportError:
    PYDANTIC_AVAILABLE = False

    class _FieldInfo:
        def __init__(self, default=None, default_factory=None):
            self.default = default
            self.default_factory = default_factory

        def get_value(self):
            if self.default_factory is not None:
                return self.default_factory()
            return self.default

    def Field(default=None, default_factory=None, **kwargs):
        return _FieldInfo(default=default, default_factory=default_factory)

    # Simple fallback placeholder if pydantic is not installed
    class BaseModel:
        def __init__(self, **kwargs):
            # Get class annotations/defaults
            for cls in reversed(self.__class__.__mro__):
                for k in getattr(cls, '__annotations__', {}):
                    if hasattr(cls, k):
                        val = getattr(cls, k)
                        if isinstance(val, _FieldInfo):
                            setattr(self, k, val.get_value())
                        else:
                            setattr(self, k, val)
            for k, v in kwargs.items():
                if isinstance(v, _FieldInfo):
                    setattr(self, k, v.get_value())
                else:
                    setattr(self, k, v)

        def dict(self, *args, **kwargs):
            res = {}
            for k, v in self.__dict__.items():
                if isinstance(v, BaseModel):
                    res[k] = v.dict()
                elif isinstance(v, list):
                    res[k] = [item.dict() if isinstance(item, BaseModel) else item for item in v]
                else:
                    res[k] = v
            return res

        def model_dump(self, *args, **kwargs):
            return self.dict(*args, **kwargs)

        @classmethod
        def model_validate(cls, obj):
            if isinstance(obj, cls):
                return obj
            if isinstance(obj, dict):
                return cls(**obj)
            return cls()

class IncidentInput(BaseModel):
    id: Optional[str] = None
    description: str
    source: str = "Citizen Report"
    latitude: float
    longitude: float
    timestamp: Optional[str] = None
    category: Optional[str] = None
    sensor_data: Optional[Dict[str, Any]] = None

    def get_timestamp_dt(self) -> datetime:
        if not self.timestamp:
            return datetime.now(timezone.utc)
        try:
            return datetime.fromisoformat(self.timestamp.replace("Z", "+00:00"))
        except Exception:
            return datetime.now(timezone.utc)

class TriageResult(BaseModel):
    emergency_type: str  # "Fire", "Medical", "Flood", "HAZMAT", "Road Accident", "Structural Collapse", "Other"
    severity_level: int  # 1 to 5
    severity_label: str  # "Low", "Medium", "High", "Critical"
    casualties_estimated: int
    required_capabilities: List[str]
    confidence: float
    reasoning: str

class DuplicateCheckInput(BaseModel):
    new_report: IncidentInput
    existing_reports: List[IncidentInput]
    max_distance_meters: float = 500.0
    max_time_diff_minutes: float = 30.0
    semantic_threshold: float = 0.55

class DuplicateCheckResult(BaseModel):
    is_duplicate: bool
    duplicate_of_id: Optional[str] = None
    overall_score: float = 0.0
    spatial_distance_meters: float = 0.0
    time_difference_minutes: float = 0.0
    semantic_similarity: float = 0.0
    reason: str = ""

class SitRepResult(BaseModel):
    commander_summary: str  # Mandatory concise 2-sentence SitRep
    current_severity: str
    known_situation: str
    casualties_summary: str
    resources_needed: List[str]
    recommended_actions: List[str]
    generated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SOPResult(BaseModel):
    emergency_type: str
    severity: str
    title: str
    checklist_items: List[str]
    safety_warnings: List[str]
    ai_disclaimer: str = (
        "AI-generated tactical guidance for decision-support only. "
        "Validate against official emergency protocol SOPs before field deployment."
    )
