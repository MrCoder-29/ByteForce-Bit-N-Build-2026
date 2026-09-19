"""
Unified AIService Interface.
Primary module entry point consumed by Member 2 (FastAPI Backend Dispatch Engine).
"""

import logging
from typing import List, Dict, Any, Optional, Union
from .models import (
    IncidentInput,
    TriageResult,
    DuplicateCheckResult,
    SitRepResult,
    SOPResult
)
from .llm_client import LLMClient
from .classifier import IncidentClassifier
from .duplicate_detector import DuplicateDetector
from .sitrep_generator import SitRepGenerator
from .sop_generator import SOPGenerator

logger = logging.getLogger("ai_triage.service")

class AIService:
    """
    Main Service Class for AI Engine & Triage.
    Provides clean methods for incident classification, duplicate detection, SitRep, and SOP generation.
    """
    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm_client = llm_client or LLMClient()
        self.classifier = IncidentClassifier(self.llm_client)
        self.duplicate_detector = DuplicateDetector()
        self.sitrep_generator = SitRepGenerator(self.llm_client)
        self.sop_generator = SOPGenerator(self.llm_client)

    def _ensure_incident_input(self, data: Union[IncidentInput, Dict[str, Any]]) -> IncidentInput:
        if isinstance(data, IncidentInput):
            return data
        if isinstance(data, dict):
            return IncidentInput(**data)
        raise ValueError(f"Invalid incident data type: {type(data)}")

    def classify_incident(self, incident: Union[IncidentInput, Dict[str, Any]]) -> TriageResult:
        """
        Classifies emergency type, severity (1-5), casualty estimates, and required capabilities.
        Accepts IncidentInput model or Python dict.
        """
        inp = self._ensure_incident_input(incident)
        return self.classifier.classify(inp)

    def check_duplicate(
        self,
        new_report: Union[IncidentInput, Dict[str, Any]],
        existing_reports: List[Union[IncidentInput, Dict[str, Any]]]
    ) -> DuplicateCheckResult:
        """
        Checks if new_report is a spatial-temporal + semantic duplicate of any existing_reports.
        """
        new_inp = self._ensure_incident_input(new_report)
        existing_inps = [self._ensure_incident_input(r) for r in existing_reports]
        return self.duplicate_detector.check_duplicate(new_inp, existing_inps)

    def generate_sitrep(
        self,
        incident_cluster: Dict[str, Any],
        triage: Optional[TriageResult] = None
    ) -> SitRepResult:
        """
        Generates 2-sentence commander Situation Report (SitRep) for an active incident cluster.
        """
        return self.sitrep_generator.generate_sitrep(incident_cluster, triage)

    def generate_sop(self, emergency_type: str, severity: Union[int, str]) -> SOPResult:
        """
        Generates tactical responder SOP checklist based on incident type and severity.
        """
        return self.sop_generator.generate_sop(emergency_type, severity)
