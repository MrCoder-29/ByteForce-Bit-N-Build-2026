"""
Tactical SOP (Standard Operating Procedure) Checklist Generator.
Generates concise, prioritized responder action checklists tailored by emergency type & severity.
"""

import logging
from typing import List, Optional, Union
from .models import SOPResult
from .llm_client import LLMClient

logger = logging.getLogger("ai_triage.sop_generator")

class SOPGenerator:
    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm_client = llm_client or LLMClient()

    def generate_sop(self, emergency_type: str, severity: Union[int, str]) -> SOPResult:
        """
        Generates standard operating procedure checklist for tactical responders.
        """
        if self.llm_client.is_api_available():
            llm_sop = self._generate_llm(emergency_type, str(severity))
            if llm_sop:
                return llm_sop

        return self._generate_heuristic(emergency_type, str(severity))

    def _generate_llm(self, emergency_type: str, severity: str) -> Optional[SOPResult]:
        prompt = f"""
Generate a concise tactical Standard Operating Procedure (SOP) checklist for field first responders.

Incident Context:
- Emergency Type: {emergency_type}
- Severity Rating: {severity}

Return a JSON object with EXACTLY these keys:
- title: string (e.g. "Tactical Response SOP: Industrial Fire (Critical Severity)")
- checklist_items: list of strings (5-7 clear, step-by-step prioritized responder actions)
- safety_warnings: list of strings (2-4 hazard alerts for responder safety)
"""
        system = "You are a Senior Public Safety Operations Specialist drafting field responder SOP checklists."
        res = self.llm_client.generate_json(prompt, system)
        if res:
            try:
                return SOPResult(
                    emergency_type=emergency_type,
                    severity=str(severity),
                    title=res.get("title", f"Tactical Response SOP: {emergency_type}"),
                    checklist_items=res.get("checklist_items", ["Approach with caution", "Assess hazards"]),
                    safety_warnings=res.get("safety_warnings", ["Wear full Personal Protective Equipment (PPE)"])
                )
            except Exception as e:
                logger.warning(f"Error parsing LLM SOP response: {e}")

        return None

    def _generate_heuristic(self, emergency_type: str, severity: str) -> SOPResult:
        etype = emergency_type.capitalize()
        sev_str = str(severity).capitalize()

        # Database of standard tactical SOP checklists
        sop_database = {
            "Fire": {
                "title": f"Fire Suppression & Search Tactical SOP ({sev_str} Severity)",
                "checklist": [
                    "1. En route: Verify wind direction and position engine upwind/up-slope.",
                    "2. Arrival: Establish hot, warm, and cold zone safety perimeters.",
                    "3. Perform 360-degree size-up and confirm active utility shutoffs (gas/electric).",
                    "4. Deploy primary attack hose lines and initiate primary search & rescue.",
                    "5. Establish rapid intervention team (RIT) on standby at command post.",
                    "6. Monitor structural integrity and coordinate ventilation operations."
                ],
                "warnings": [
                    "HIGH RISK: Flashover and structural roof collapse potential.",
                    "Toxic smoke inhalation hazard — SCBA mandatory inside hot zone."
                ]
            },
            "Hazmat": {
                "title": f"HAZMAT Chemical Containment SOP ({sev_str} Severity)",
                "checklist": [
                    "1. Isolate scene immediately: Minimum 300m initial evacuation radius.",
                    "2. Position command post strictly upwind and uphill from release site.",
                    "3. Identify hazardous material UN number / SDS shipping manifest.",
                    "4. Equip Entry Team with Level A/B encapsulated chemical suits.",
                    "5. Set up multi-stage responder decontamination corridor prior to hot zone entry.",
                    "6. Contain runoff to prevent environmental watershed contamination."
                ],
                "warnings": [
                    "EXTREME TOXICITY HAZARD: Do not enter hot zone without vapor suit.",
                    "Secondary explosion or chemical reaction risk upon contact with water."
                ]
            },
            "Flood": {
                "title": f"Swiftwater & Inundation Rescue SOP ({sev_str} Severity)",
                "checklist": [
                    "1. Deploy PFDs (Personal Flotation Devices) and helmets for all personnel before approaching water.",
                    "2. Launch motorized inflatable rescue craft or swiftwater tether lines.",
                    "3. Establish downstream safety spotters with throw bags and rescue lights.",
                    "4. Prioritize roof-top and stranded vehicle victim extractions.",
                    "5. Coordinate with local utilities to cut power lines in flooded structures."
                ],
                "warnings": [
                    "SWIFTWATER HAZARD: Hidden submerged strainers and electrical shock hazard.",
                    "Hypothermia risk during prolonged water operations."
                ]
            },
            "Medical": {
                "title": f"Mass Casualty Triage & EMS Response SOP ({sev_str} Severity)",
                "checklist": [
                    "1. Conduct START triage (Immediate/Red, Delayed/Yellow, Minor/Green, Expectant/Black).",
                    "2. Establish casualty collection point (CCP) in secure cold zone.",
                    "3. Prioritize tourniquet application and airway management for Red-tagged patients.",
                    "4. Coordinate transport staging and request regional trauma center readiness."
                ],
                "warnings": [
                    "BIOLOGICAL HAZARD: Universal precautions and bloodborne pathogen protection required.",
                    "Ensure scene safety clearance from law enforcement before EMS entry."
                ]
            },
            "Road accident": {
                "title": f"Vehicle Extrication & Highway Safety SOP ({sev_str} Severity)",
                "checklist": [
                    "1. Block traffic lanes using heavy apparatus to create secure responder workspace.",
                    "2. Stabilize vehicle using wheel chocks and step chocks.",
                    "3. Disconnect 12V / high-voltage EV battery systems.",
                    "4. Perform hydraulic tool glass management and door/roof removal for extrication.",
                    "5. Transfer patient seamlessly to EMS trauma crew."
                ],
                "warnings": [
                    "HIGHWAY HAZARD: Secondary vehicle collisions at crash scene.",
                    "High-voltage battery thermal runaway hazard on Electric Vehicles."
                ]
            }
        }

        # Select match or default
        matched_data = sop_database.get(etype) or sop_database.get(emergency_type)
        if not matched_data:
            matched_data = {
                "title": f"General Tactical Emergency Response SOP ({sev_str} Severity)",
                "checklist": [
                    "1. Maintain radio communication with Dispatch Command.",
                    "2. Conduct initial hazard assessment and scene size-up.",
                    "3. Establish safety perimeter and secure entry control point.",
                    "4. Render emergency aid to victims within scope of training.",
                    "5. Report situation updates every 15 minutes."
                ],
                "warnings": [
                    "Maintain continuous situational awareness.",
                    "Ensure appropriate Personal Protective Equipment (PPE) is worn."
                ]
            }

        return SOPResult(
            emergency_type=emergency_type,
            severity=sev_str,
            title=matched_data["title"],
            checklist_items=matched_data["checklist"],
            safety_warnings=matched_data["warnings"]
        )
