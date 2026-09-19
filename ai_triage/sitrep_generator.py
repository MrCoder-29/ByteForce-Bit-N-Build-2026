"""
Emergency SitRep (Situation Report) Generator.
Generates 2-sentence executive commander summary and tactical situation overview.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from .models import SitRepResult, TriageResult
from .llm_client import LLMClient

logger = logging.getLogger("ai_triage.sitrep_generator")

class SitRepGenerator:
    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm_client = llm_client or LLMClient()

    def generate_sitrep(self, incident_cluster: Dict[str, Any], triage: Optional[TriageResult] = None) -> SitRepResult:
        """
        Generates structured Commander SitRep from consolidated incident cluster details.
        """
        if self.llm_client.is_api_available():
            llm_sitrep = self._generate_llm(incident_cluster, triage)
            if llm_sitrep:
                return llm_sitrep

        return self._generate_heuristic(incident_cluster, triage)

    def _generate_llm(self, cluster: Dict[str, Any], triage: Optional[TriageResult]) -> Optional[SitRepResult]:
        prompt = f"""
Generate an Incident Command Situation Report (SitRep) for the following emergency cluster.

Incident Data:
- Cluster ID: {cluster.get('cluster_id', 'CL-001')}
- Emergency Type: {cluster.get('emergency_type', triage.emergency_type if triage else 'Emergency')}
- Primary Location: ({cluster.get('latitude')}, {cluster.get('longitude')})
- Active Reports Count: {len(cluster.get('report_ids', [1]))}
- Consolidated Summary: "{cluster.get('consolidated_summary', cluster.get('description', ''))}"
- Estimated Casualties: {cluster.get('casualties_estimated', triage.casualties_estimated if triage else 0)}

Return a JSON object with EXACTLY these keys:
- commander_summary: EXACTLY 2 concise, high-impact sentences for the incident commander.
- current_severity: string ("Critical", "High", "Medium", "Low")
- known_situation: string (factual description of current tactical state)
- casualties_summary: string (status of injured/trapped victims)
- resources_needed: list of strings (required emergency units/equipment)
- recommended_actions: list of strings (immediate tactical response priorities)
"""
        system = "You are a Chief Emergency Operations Commander producing tactical Situation Reports (SitReps)."
        res = self.llm_client.generate_json(prompt, system)
        if res:
            try:
                return SitRepResult(
                    commander_summary=res.get("commander_summary", "Incident active. Response units dispatched."),
                    current_severity=res.get("current_severity", "High"),
                    known_situation=res.get("known_situation", "Emergency reported at location."),
                    casualties_summary=res.get("casualties_summary", "No casualties reported."),
                    resources_needed=res.get("resources_needed", ["EMS", "Local Patrol"]),
                    recommended_actions=res.get("recommended_actions", ["Establish perimeter", "Assess scene"]),
                    generated_at=datetime.now(timezone.utc).isoformat()
                )
            except Exception as e:
                logger.warning(f"Error parsing LLM SitRep response: {e}")

        return None

    def _generate_heuristic(self, cluster: Dict[str, Any], triage: Optional[TriageResult]) -> SitRepResult:
        etype = cluster.get("emergency_type") or (triage.emergency_type if triage else "Emergency")
        sev_label = cluster.get("severity_label") or (triage.severity_label if triage else "High")
        casualties = cluster.get("casualties_estimated", triage.casualties_estimated if triage else 0)
        desc = cluster.get("consolidated_summary") or cluster.get("description") or "Active emergency incident reported."
        reports_count = len(cluster.get("report_ids", [1]))

        # Format 2-sentence commander summary
        sentence1 = f"A {sev_label}-severity {etype} incident is active with {reports_count} consolidated report(s) at coordinates ({cluster.get('latitude', 0.0)}, {cluster.get('longitude', 0.0)})."
        
        if casualties > 0:
            sentence2 = f"An estimated {casualties} victim(s) require immediate field medical attention and tactical response units are priority-dispatched."
        else:
            sentence2 = f"Emergency response forces are establishing initial perimeter control and conducting scene assessment."

        commander_summary = f"{sentence1} {sentence2}"

        # Resources needed
        resources = list(cluster.get("required_capabilities") or (triage.required_capabilities if triage else ["general_response"]))
        if "command_vehicle" not in resources:
            resources.append("command_vehicle")

        return SitRepResult(
            commander_summary=commander_summary,
            current_severity=sev_label,
            known_situation=desc,
            casualties_summary=f"{casualties} estimated victims requiring triage and care." if casualties > 0 else "No immediate casualties confirmed.",
            resources_needed=resources,
            recommended_actions=[
                "Establish Incident Command Post (ICP) and safety perimeter.",
                "Dispatch primary response units equipped with specified capabilities.",
                "Maintain continuous radio contact with Dispatch Command."
            ],
            generated_at=datetime.now(timezone.utc).isoformat()
        )
