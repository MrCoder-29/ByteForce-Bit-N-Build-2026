import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Incident, DispatchAssignment
from app.config import settings
from app.websocket_manager import manager as ws_manager

logger = logging.getLogger("escalation_monitor")

async def monitor_sla_escalations():
    """
    Background worker that runs continuously checking for unassigned 
    Critical incidents breaching the SLA timer threshold (e.g. 90 seconds).
    """
    logger.info(f"SLA Escalation Monitor active. Threshold: {settings.SLA_CRITICAL_UNASSIGNED_SECONDS}s")
    
    while True:
        try:
            db: Session = SessionLocal()
            try:
                now = datetime.utcnow()
                cutoff_time = now - timedelta(seconds=settings.SLA_CRITICAL_UNASSIGNED_SECONDS)
                
                # Query Critical incidents that remain unassigned (status in Reported or Triaged)
                critical_unassigned = db.query(Incident).filter(
                    Incident.severity == "Critical",
                    Incident.status.in_(["Reported", "Triaged"]),
                    Incident.created_at <= cutoff_time,
                    Incident.is_escalated == False
                ).all()

                for incident in critical_unassigned:
                    # Check if there are truly no active assignments
                    active_assignments = db.query(DispatchAssignment).filter(
                        DispatchAssignment.incident_id == incident.id,
                        DispatchAssignment.status.in_(["Assigned", "En Route", "On Scene"])
                    ).count()

                    if active_assignments == 0:
                        incident.is_escalated = True
                        incident.escalated_at = now
                        db.commit()
                        db.refresh(incident)

                        logger.warning(f"SLA BREACH: Incident #{incident.id} '{incident.title}' escalated!")

                        # Broadcast WebSocket Escalation Event
                        await ws_manager.broadcast("escalation_triggered", {
                            "incident_id": incident.id,
                            "title": incident.title,
                            "emergency_type": incident.emergency_type,
                            "severity": incident.severity,
                            "latitude": incident.latitude,
                            "longitude": incident.longitude,
                            "unassigned_duration_seconds": int((now - incident.created_at).total_seconds()),
                            "message": f"CRITICAL INCIDENT ALERT: Incident #{incident.id} has remained unassigned for over {settings.SLA_CRITICAL_UNASSIGNED_SECONDS}s!"
                        })

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in SLA escalation monitor: {e}")

        # Sleep interval between checks
        await asyncio.sleep(settings.ESCALATION_CHECK_INTERVAL_SECONDS)
