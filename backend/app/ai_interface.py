import sys
import os
import logging
from pathlib import Path
from typing import Dict, Any, List

logger = logging.getLogger("ai_interface")

# Add project root to sys.path so ai_triage can be imported
workspace_root = str(Path(__file__).resolve().parent.parent.parent)
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

try:
    from ai_triage.service import AIService
    _ai_service_instance = AIService()
except Exception as _ai_err:
    logger.warning(f"Could not initialize ai_triage AIService: {_ai_err}. Using heuristic fallback.")
    _ai_service_instance = None

class AIInterface:
    """
    Adapter interface connecting FastAPI backend to Member 1's AI Service (ai_triage).
    Includes heuristic fallback if Member 1's module is not available.
    """

    @staticmethod
    def classify_report(raw_text: str, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Classifies raw report text into emergency_type, severity, title, and required capabilities.
        """
        if _ai_service_instance is not None:
            try:
                res = _ai_service_instance.classify_incident({
                    "description": raw_text,
                    "latitude": latitude,
                    "longitude": longitude
                })
                sev_str = getattr(res, "severity_label", None) or "Medium"
                sev_level = getattr(res, "severity_level", 3)
                
                sop_res = _ai_service_instance.generate_sop(res.emergency_type, sev_level)
                sop_lines = [item.action for item in getattr(sop_res, "checklist", [])] if hasattr(sop_res, "checklist") else []
                if not sop_lines:
                    sop_lines = [
                        f"Deploy primary {res.emergency_type} taskforce.",
                        f"Equip responders with capabilities: {', '.join(res.required_capabilities)}.",
                        "Establish 200m perimeter cordon."
                    ]

                return {
                    "title": raw_text[:50] + "..." if len(raw_text) > 50 else raw_text,
                    "emergency_type": res.emergency_type,
                    "severity": sev_str,
                    "required_capabilities": res.required_capabilities,
                    "sop_guidelines": sop_lines
                }
            except Exception as e:
                logger.warning(f"Error calling ai_triage classifier: {e}. Falling back to heuristics.")
            
        text_lower = raw_text.lower()
        emergency_type = "General"
        severity = "Medium"
        capabilities = ["General Response"]
        title = raw_text[:50] + "..." if len(raw_text) > 50 else raw_text

        # Heuristic keywords
        if any(w in text_lower for w in ["fire", "smoke", "explosion", "flame", "blaze"]):
            emergency_type = "Fire"
            capabilities = ["Fire Suppression", "Hazmat"]
            if any(w in text_lower for w in ["explosion", "trapped", "major", "chemical"]):
                severity = "Critical"
                capabilities.append("Advanced Life Support")
            else:
                severity = "High"

        elif any(w in text_lower for w in ["flood", "drowning", "water", "river", "submerged"]):
            emergency_type = "Flood"
            capabilities = ["Water Rescue", "Flood Support"]
            if "drowning" in text_lower or "trapped" in text_lower:
                severity = "Critical"
                capabilities.append("Advanced Life Support")
            else:
                severity = "High"

        elif any(w in text_lower for w in ["cardiac", "stroke", "bleed", "unconscious", "injury", "medical", "patient"]):
            emergency_type = "Medical"
            capabilities = ["Advanced Life Support", "Patient Transport"]
            if any(w in text_lower for w in ["unconscious", "cardiac", "critical", "severe"]):
                severity = "Critical"
            else:
                severity = "Medium"

        elif any(w in text_lower for w in ["chemical", "gas leak", "hazard", "toxic"]):
            emergency_type = "HAZMAT"
            severity = "Critical"
            capabilities = ["Hazmat Isolation", "Decontamination"]

        elif any(w in text_lower for w in ["crash", "accident", "collision", "vehicle"]):
            emergency_type = "Road Accident"
            severity = "High"
            capabilities = ["Traffic Control", "Patient Transport", "Extrication"]

        sop_guidelines = [
            f"Dispatch {emergency_type} primary response unit.",
            f"Ensure responders possess capabilities: {', '.join(capabilities)}.",
            "Establish safe perimeter on arrival."
        ]

        return {
            "title": title,
            "emergency_type": emergency_type,
            "severity": severity,
            "required_capabilities": capabilities,
            "sop_guidelines": sop_guidelines
        }

    @staticmethod
    def generate_sitrep(incident_title: str, emergency_type: str, severity: str, reports_count: int) -> str:
        """
        Generates tactical Commander SitRep text summary.
        """
        if _ai_service_instance is not None:
            try:
                res = _ai_service_instance.generate_sitrep({
                    "title": incident_title,
                    "emergency_type": emergency_type,
                    "severity": severity,
                    "reports_count": reports_count
                })
                if hasattr(res, "commander_summary") and res.commander_summary:
                    return res.commander_summary
                if hasattr(res, "summary") and res.summary:
                    return res.summary
            except Exception as e:
                logger.warning(f"Error calling ai_triage sitrep generator: {e}")

        return (
            f"SITREP ALERT: Active {severity} {emergency_type} incident ({incident_title}). "
            f"Ingested {reports_count} citizen report(s). Tactical units are requested for priority dispatch."
        )

ai_interface = AIInterface()
