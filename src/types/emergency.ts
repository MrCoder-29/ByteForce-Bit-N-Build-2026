export type EmergencyType = 'FIRE' | 'MEDICAL' | 'FLOOD' | 'ACCIDENT' | 'HAZMAT' | 'CRIME' | 'STRUCTURAL';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 'PENDING' | 'TRIAGED' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RESOLVED';

export type ResourceType = 'AMBULANCE' | 'FIRE_ENGINE' | 'POLICE_PATROL' | 'HAZMAT_UNIT' | 'RESCUE_BOAT' | 'DRONE';

export type ResourceStatus = 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'MAINTENANCE' | 'OFFLINE';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
  cityZone?: string;
}

export interface DuplicateReport {
  id: string;
  timestamp: string;
  source: string;
  reporterPhone?: string;
  rawText: string;
}

export interface TimelineEvent {
  timestamp: string;
  label: string;
  details: string;
  type: 'CALL' | 'TRIAGE' | 'DISPATCH' | 'EN_ROUTE' | 'ON_SCENE' | 'RESOLVED';
}

export interface CasualtiesInfo {
  injured: number;
  fatalities: number;
  trapped: number;
  summary: string;
}

export interface Incident {
  id: string;
  title: string;
  type: EmergencyType;
  severity: SeverityLevel;
  status: IncidentStatus;
  location: Location;
  timestamp: string;
  source: 'CITIZEN_APP' | '911_HOTLINE' | 'IOT_SENSOR' | 'SOCIAL_MEDIA' | 'DRONE_FEED';
  duplicateCount: number;
  duplicates?: DuplicateReport[];
  aiSummary: string;
  riskScore: number; // 0 to 100
  requiredCapabilities: string[];
  assignedUnitId?: string;
  assignedUnitCallsign?: string;
  slaMinutesRemaining: number;
  callerContact?: string;
  mediaUrls?: string[];
  notes?: string[];
  estimatedCasualties?: CasualtiesInfo;
  timeline?: TimelineEvent[];
}

export interface ResourceUnit {
  id: string;
  callsign: string;
  type: ResourceType;
  status: ResourceStatus;
  location: Location;
  personnelCount: number;
  capabilities: string[];
  batteryOrFuelPercent: number;
  contactChannel: string;
  currentIncidentId?: string;
  assignedTimestamp?: string;
}

export interface DispatchRecommendation {
  unitId: string;
  unit: ResourceUnit;
  score: number; // 0 to 100 match rating
  distanceKm: number;
  etaMinutes: number;
  matchedCapabilities: string[];
  missingCapabilities: string[];
  reasoning: string;
}

export interface DispatchPayload {
  incidentId: string;
  unitId: string;
  dispatchNotes?: string;
  priorityOverride?: boolean;
}

export interface DispatchResponse {
  success: boolean;
  message: string;
  incidentId: string;
  unitId: string;
  assignedTimestamp: string;
  etaMinutes: number;
}

export interface AlertNotice {
  id: string;
  type: 'CRITICAL_INCIDENT' | 'SLA_BREACH' | 'RESOURCE_SHORTAGE' | 'DELAYED_RESPONSE' | 'ESCALATION';
  title: string;
  message: string;
  timestamp: string;
  incidentId?: string;
  severity: SeverityLevel;
  acknowledged: boolean;
}

export interface SituationReport {
  generatedAt: string;
  overallRiskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  executiveSummary: string;
  criticalBottlenecks: string[];
  aiRecommendations: string[];
  activeZoneThreats: { zone: string; threat: string; level: string }[];
}

export interface AnalyticsData {
  totalIncidents: number;
  activeIncidents: number;
  resolvedIncidents: number;
  avgResponseTimeMin: number;
  availableUnits: number;
  dispatchedUnits: number;
  incidentsByType: { type: string; count: number; color: string }[];
  severityDistribution: { severity: string; count: number; color: string }[];
  responseTimeTrends: { time: string; avgMin: number; targetMin: number }[];
  resourceUtilization: { type: string; available: number; deployed: number; total: number }[];
  areaDensity: { area: string; incidents: number; riskLevel: string }[];
  situationReport?: SituationReport;
}

export interface WebSocketMessage {
  event: 'INCIDENT_NEW' | 'INCIDENT_UPDATE' | 'UNIT_DISPATCHED' | 'UNIT_STATUS_CHANGE' | 'ESCALATION_ALERT' | 'SYSTEM_HEARTBEAT';
  timestamp: string;
  payload: any;
}
