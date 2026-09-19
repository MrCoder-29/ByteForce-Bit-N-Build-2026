"""
Incident Classification Engine.
Determines emergency type, severity rating (1-5 / Critical..Low), casualty estimates, and required capabilities.
Combines rule-based telemetry/keyword heuristics with LLM structuring.
"""

import re
import logging
from typing import List, Dict, Any, Optional
from .models import IncidentInput, TriageResult
from .llm_client import LLMClient

logger = logging.getLogger("ai_triage.classifier")

class IncidentClassifier:
    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm_client = llm_client or LLMClient()

    def classify(self, incident: IncidentInput) -> TriageResult:
        """
        Classifies incident report into structured triage output.
        """
        # Try LLM first if available
        if self.llm_client.is_api_available():
            llm_result = self._classify_llm(incident)
            if llm_result:
                return llm_result

        # Fallback to smart heuristic classifier
        return self._classify_heuristic(incident)

    def _classify_llm(self, incident: IncidentInput) -> Optional[TriageResult]:
        prompt = f"""
Analyze the following emergency incident report and return structured triage JSON.

Incident Context:
- Description: "{incident.description}"
- Reported Source: "{incident.source}"
- Location: ({incident.latitude}, {incident.longitude})
- Provided Category: "{incident.category or 'N/A'}"
- Sensor Data: {incident.sensor_data or 'None'}

Return a JSON object with EXACTLY these keys:
- emergency_type: string (One of: "Fire", "Medical", "Flood", "HAZMAT", "Road Accident", "Structural Collapse", "Other")
- severity_level: integer between 1 and 5 (1 = Minor, 5 = Catastrophic)
- severity_label: string (One of: "Low", "Medium", "High", "Critical")
- casualties_estimated: integer (estimated injured or deceased victims based on text/telemetry)
- required_capabilities: list of strings (e.g. ["firefighting", "advanced_life_support", "search_and_rescue", "hazmat_containment", "heavy_lifting", "traffic_control", "water_rescue"])
- confidence: float between 0.0 and 1.0
- reasoning: string (brief explanation of the classification rationale)
"""
        system = "You are an expert AI Emergency Triage Dispatcher for an Incident Command Center. Produce precise JSON triage assessments."
        res = self.llm_client.generate_json(prompt, system)
        if res:
            try:
                sev_level = int(res.get("severity_level", 3))
                sev_level = max(1, min(5, sev_level))
                
                label_map = {1: "Low", 2: "Medium", 3: "High", 4: "Critical", 5: "Critical"}
                sev_label = res.get("severity_label") or label_map.get(sev_level, "High")

                return TriageResult(
                    emergency_type=res.get("emergency_type", "Other"),
                    severity_level=sev_level,
                    severity_label=sev_label,
                    casualties_estimated=int(res.get("casualties_estimated", 0)),
                    required_capabilities=res.get("required_capabilities", ["general_response"]),
                    confidence=float(res.get("confidence", 0.90)),
                    reasoning=res.get("reasoning", "LLM automated triage assessment.")
                )
            except Exception as e:
                logger.warning(f"Error parsing LLM response for classification: {e}")

        return None

    def _classify_heuristic(self, incident: IncidentInput) -> TriageResult:
        text = (incident.description + " " + (incident.category or "")).lower()
        sensor = incident.sensor_data or {}

        # Default values
        emergency_type = "Other"
        severity_level = 2
        casualties = 0
        capabilities: List[str] = []
        reasoning_parts: List[str] = []

        # 1. Emergency Type Detection
        if any(w in text for w in ["fire", "blaze", "smoke", "burning", "flames", "explosion"]):
            emergency_type = "Fire"
            capabilities.extend(["firefighting", "smoke_ventilation", "thermal_imaging"])
            reasoning_parts.append("Fire/flame keywords detected")
        elif any(w in text for w in ["hazmat", "chemical", "toxic", "gas leak", "radiation", "acid", "spill"]):
            emergency_type = "HAZMAT"
            capabilities.extend(["hazmat_containment", "decontamination", "chemical_detection", "respirators"])
            reasoning_parts.append("HAZMAT/chemical leak indicators present")
        elif any(w in text for w in ["flood", "drowning", "submerged", "overflow", "inundated", "water rise"]):
            emergency_type = "Flood"
            capabilities.extend(["water_rescue", "boats", "swiftwater_team", "evacuation_pumps"])
            reasoning_parts.append("Flood/water inundation keywords detected")
        elif any(w in text for w in ["collapse", "trapped under debris", "building down", "rubble"]):
            emergency_type = "Structural Collapse"
            capabilities.extend(["heavy_rescue", "canine_search", "structural_shoring", "k-12_saws"])
            reasoning_parts.append("Structural damage / collapse indicators present")
        elif any(w in text for w in ["crash", "accident", "collision", "vehicle", "overturned"]):
            emergency_type = "Road Accident"
            capabilities.extend(["hydraulic_extrication", "traffic_control", "towing", "basic_life_support"])
            reasoning_parts.append("Traffic vehicle accident keywords detected")
        elif any(w in text for w in ["cardiac", "stroke", "unconscious", "bleeding", "patient", "seizure", "injured"]):
            emergency_type = "Medical"
            capabilities.extend(["advanced_life_support", "ambulance", "paramedic"])
            reasoning_parts.append("Medical emergency indicators detected")

        # Sensor input overrides/enhancements
        if sensor.get("smoke_ppm", 0) > 300 or sensor.get("temp_celsius", 0) > 60:
            emergency_type = "Fire"
            capabilities.append("thermal_imaging")
            reasoning_parts.append(f"Sensor trigger: Smoke={sensor.get('smoke_ppm')}ppm, Temp={sensor.get('temp_celsius')}C")

        if sensor.get("gas_level_ppm", 0) > 100:
            emergency_type = "HAZMAT"
            capabilities.append("hazmat_containment")
            reasoning_parts.append(f"Sensor trigger: Gas Level={sensor.get('gas_level_ppm')}ppm")

        # 2. Casualty Estimation
        casualty_matches = re.findall(r"(\d+)\s*(injur|hurt|casualt|victims|people trapped|dead|patients)", text)
        if casualty_matches:
            try:
                casualties = sum(int(m[0]) for m in casualty_matches)
                reasoning_parts.append(f"Parsed {casualties} potential victims from report text")
            except ValueError:
                pass
        
        if casualties > 0 and "advanced_life_support" not in capabilities:
            capabilities.append("advanced_life_support")

        # 3. Severity Level Calculation
        if any(w in text for w in ["massive", "catastrophic", "multiple deaths", "explosion", "toxic cloud", "building collapse"]):
            severity_level = 5
        elif casualties >= 5 or any(w in text for w in ["severe", "critical", "trapped", "spreading fast", "out of control"]):
            severity_level = 4
        elif casualties > 0 or emergency_type in ["Fire", "HAZMAT", "Structural Collapse"]:
            severity_level = 3
        elif emergency_type in ["Road Accident", "Medical"]:
            severity_level = 2
        else:
            severity_level = 1

        label_map = {1: "Low", 2: "Medium", 3: "High", 4: "Critical", 5: "Critical"}
        severity_label = label_map[severity_level]

        # Clean capabilities
        unique_capabilities = list(dict.fromkeys(capabilities)) if capabilities else ["general_response"]

        return TriageResult(
            emergency_type=emergency_type,
            severity_level=severity_level,
            severity_label=severity_label,
            casualties_estimated=casualties,
            required_capabilities=unique_capabilities,
            confidence=0.85,
            reasoning="; ".join(reasoning_parts) if reasoning_parts else "Rule-based heuristic assessment."
        )
