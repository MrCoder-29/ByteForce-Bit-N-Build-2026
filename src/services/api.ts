import { 
  Incident, 
  ResourceUnit, 
  DispatchPayload, 
  DispatchResponse, 
  AnalyticsData, 
  DispatchRecommendation,
  EmergencyType,
  IncidentStatus,
  SeverityLevel,
  ResourceType,
  ResourceStatus
} from '../types/emergency';
import { INITIAL_INCIDENTS, INITIAL_RESOURCE_UNITS, INITIAL_ANALYTICS, calculateMockRecommendations } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false';

// Memory store for local state updates when running in mock fallback mode
let localIncidents: Incident[] = [...INITIAL_INCIDENTS];
let localUnits: ResourceUnit[] = [...INITIAL_RESOURCE_UNITS];

function roundCoord(num: number): number {
  return Math.round(num * 10000) / 10000;
}

export function normalizeBackendIncident(raw: any): Incident {
  if (!raw) return localIncidents[0];

  const typeMap: Record<string, EmergencyType> = {
    FIRE: 'FIRE', Fire: 'FIRE',
    MEDICAL: 'MEDICAL', Medical: 'MEDICAL',
    FLOOD: 'FLOOD', Flood: 'FLOOD',
    HAZMAT: 'HAZMAT', Hazmat: 'HAZMAT',
    'ROAD ACCIDENT': 'ACCIDENT', 'Road Accident': 'ACCIDENT', ACCIDENT: 'ACCIDENT',
    CRIME: 'CRIME', Crime: 'CRIME',
    STRUCTURAL: 'STRUCTURAL', 'Structural Collapse': 'STRUCTURAL', General: 'FIRE'
  };

  const statusMap: Record<string, IncidentStatus> = {
    Reported: 'PENDING', PENDING: 'PENDING',
    Triaged: 'TRIAGED', TRIAGED: 'TRIAGED',
    Dispatched: 'DISPATCHED', DISPATCHED: 'DISPATCHED',
    'On Scene': 'ON_SCENE', ON_SCENE: 'ON_SCENE',
    Resolved: 'RESOLVED', RESOLVED: 'RESOLVED',
    'En Route': 'EN_ROUTE', EN_ROUTE: 'EN_ROUTE'
  };

  const severityMap: Record<string, SeverityLevel> = {
    Critical: 'CRITICAL', CRITICAL: 'CRITICAL',
    High: 'HIGH', HIGH: 'HIGH',
    Medium: 'MEDIUM', MEDIUM: 'MEDIUM',
    Low: 'LOW', LOW: 'LOW'
  };

  const lat = raw.latitude ?? raw.location?.lat ?? 19.0760;
  const lng = raw.longitude ?? raw.location?.lng ?? 72.8777;
  const address = raw.location_name || raw.location?.address || `Sector (${roundCoord(lat)}, ${roundCoord(lng)})`;

  const rawType = raw.emergency_type || raw.type || 'FIRE';
  const rawSev = raw.severity || 'MEDIUM';
  const rawStat = raw.status || 'Reported';

  const riskScore = (rawSev === 'Critical' || rawSev === 'CRITICAL') ? 94
    : (rawSev === 'High' || rawSev === 'HIGH') ? 82
    : (rawSev === 'Medium' || rawSev === 'MEDIUM') ? 55 : 30;

  return {
    id: String(raw.id || `INC-${Date.now()}`),
    title: raw.title || 'Emergency Incident',
    type: typeMap[rawType] || 'FIRE',
    severity: severityMap[rawSev] || 'MEDIUM',
    status: statusMap[rawStat] || 'PENDING',
    location: {
      lat: Number(lat),
      lng: Number(lng),
      address: String(address),
      cityZone: raw.location?.cityZone || 'Metro Sector'
    },
    timestamp: raw.created_at || raw.timestamp || new Date().toISOString(),
    source: raw.source || 'CITIZEN_APP',
    duplicateCount: Array.isArray(raw.report_ids) ? raw.report_ids.length : (raw.duplicateCount || 0),
    aiSummary: raw.sitrep_summary || raw.description || raw.aiSummary || 'Active incident registered in Command Center.',
    riskScore: raw.riskScore || riskScore,
    requiredCapabilities: raw.required_capabilities || raw.requiredCapabilities || ['Rapid Response'],
    assignedUnitId: raw.assignedUnitId ? String(raw.assignedUnitId) : undefined,
    assignedUnitCallsign: raw.assignedUnitCallsign,
    slaMinutesRemaining: raw.slaMinutesRemaining ?? 10,
    callerContact: raw.callerContact || '+91 98200 11223',
    timeline: raw.timeline || [
      {
        timestamp: raw.created_at || new Date().toISOString(),
        label: 'Incident Logged',
        details: raw.description || 'Incident registered in ResQSync system',
        type: 'CALL'
      }
    ]
  };
}

export function normalizeBackendResource(raw: any): ResourceUnit {
  if (!raw) return localUnits[0];

  const typeMap: Record<string, ResourceType> = {
    Ambulance: 'AMBULANCE', AMBULANCE: 'AMBULANCE',
    'Fire Truck': 'FIRE_ENGINE', FIRE_ENGINE: 'FIRE_ENGINE',
    'Police Patrol': 'POLICE_PATROL', POLICE_PATROL: 'POLICE_PATROL',
    'Rescue Boat': 'RESCUE_BOAT', RESCUE_BOAT: 'RESCUE_BOAT',
    'Hazmat Unit': 'HAZMAT_UNIT', HAZMAT_UNIT: 'HAZMAT_UNIT',
    Hospital: 'AMBULANCE'
  };

  const statusMap: Record<string, ResourceStatus> = {
    Available: 'AVAILABLE', AVAILABLE: 'AVAILABLE',
    Dispatched: 'DISPATCHED', DISPATCHED: 'DISPATCHED',
    'On Scene': 'ON_SCENE', ON_SCENE: 'ON_SCENE',
    'En Route': 'EN_ROUTE', EN_ROUTE: 'EN_ROUTE',
    Maintenance: 'MAINTENANCE', MAINTENANCE: 'MAINTENANCE',
    Offline: 'OFFLINE', OFFLINE: 'OFFLINE'
  };

  const lat = raw.latitude ?? raw.location?.lat ?? 19.0760;
  const lng = raw.longitude ?? raw.location?.lng ?? 72.8777;
  const callsign = raw.identifier || raw.callsign || raw.name || `Unit-${raw.id}`;

  return {
    id: String(raw.id || raw.identifier || `unit-${Date.now()}`),
    callsign: String(callsign),
    type: typeMap[raw.type] || 'AMBULANCE',
    status: statusMap[raw.status] || 'AVAILABLE',
    location: {
      lat: Number(lat),
      lng: Number(lng),
      address: raw.name || callsign
    },
    personnelCount: raw.capacity || 2,
    capabilities: raw.capabilities || ['Emergency Care'],
    batteryOrFuelPercent: 92,
    contactChannel: raw.contact_number || 'VHF Ch 4',
    currentIncidentId: raw.currentIncidentId ? String(raw.currentIncidentId) : undefined,
    assignedTimestamp: raw.assignedTimestamp
  };
}

export const emergencyApi = {
  // Fetch all active & recent incidents
  async getIncidents(): Promise<Incident[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/incidents`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map(normalizeBackendIncident) : [];
      if (normalized.length > 0) {
        localIncidents = normalized;
        return normalized;
      }
      return localIncidents;
    } catch (err) {
      if (ENABLE_MOCK_FALLBACK) {
        console.warn('Backend API unreachable. Using Mock Incidents Data layer.');
        return localIncidents;
      }
      throw err;
    }
  },

  // Fetch all resource units
  async getResources(): Promise<ResourceUnit[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/resources`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map(normalizeBackendResource) : [];
      if (normalized.length > 0) {
        localUnits = normalized;
        return normalized;
      }
      return localUnits;
    } catch (err) {
      if (ENABLE_MOCK_FALLBACK) {
        return localUnits;
      }
      throw err;
    }
  },

  // Get AI Dispatch Recommendations for a specific incident
  async getDispatchRecommendations(incidentId: string): Promise<DispatchRecommendation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dispatch/recommendations?incidentId=${incidentId}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        return data.map((rec: any) => {
          const unit = normalizeBackendResource({
            id: rec.resource_id,
            identifier: rec.identifier,
            name: rec.name,
            type: rec.type,
            capabilities: rec.capabilities,
            status: rec.status,
            latitude: rec.latitude,
            longitude: rec.longitude
          });

          return {
            unitId: String(rec.resource_id || rec.identifier),
            unit,
            score: Math.round(rec.score || 85),
            distanceKm: Number((rec.distance_km || 2.5).toFixed(1)),
            etaMinutes: Math.round(rec.estimated_eta_minutes || 6),
            matchedCapabilities: rec.capabilities || [],
            missingCapabilities: [],
            reasoning: `Haversine distance ${(rec.distance_km || 2.5).toFixed(1)} km. Capability match score ${Math.round(rec.capability_match_score || 90)}%.`
          };
        });
      }

      // If empty backend recs, fallback to mock algorithm
      const incident = localIncidents.find(i => i.id === incidentId);
      if (!incident) return [];
      return calculateMockRecommendations(incident, localUnits);
    } catch (err) {
      if (ENABLE_MOCK_FALLBACK) {
        const incident = localIncidents.find(i => i.id === incidentId);
        if (!incident) return [];
        return calculateMockRecommendations(incident, localUnits);
      }
      throw err;
    }
  },

  // Dispatch a unit to an incident
  async dispatchUnit(payload: DispatchPayload): Promise<DispatchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Dispatch failed: ${response.status}`);
      const data = await response.json();
      return {
        success: data.success ?? true,
        message: data.message ?? `Unit ${payload.unitId} dispatched`,
        incidentId: String(data.incidentId ?? payload.incidentId),
        unitId: String(data.unitId ?? payload.unitId),
        assignedTimestamp: data.assignedTimestamp ?? new Date().toISOString(),
        etaMinutes: data.etaMinutes ?? 6
      };
    } catch (err) {
      if (ENABLE_MOCK_FALLBACK) {
        console.log('[Mock API] Executing Unit Dispatch:', payload);
        
        const unitIndex = localUnits.findIndex(u => u.id === payload.unitId);
        let unitCallsign = 'Unit';
        if (unitIndex !== -1) {
          localUnits[unitIndex] = {
            ...localUnits[unitIndex],
            status: 'DISPATCHED',
            currentIncidentId: payload.incidentId,
            assignedTimestamp: new Date().toISOString()
          };
          unitCallsign = localUnits[unitIndex].callsign;
        }

        const incidentIndex = localIncidents.findIndex(i => i.id === payload.incidentId);
        if (incidentIndex !== -1) {
          localIncidents[incidentIndex] = {
            ...localIncidents[incidentIndex],
            status: 'DISPATCHED',
            assignedUnitId: payload.unitId,
            assignedUnitCallsign: unitCallsign,
          };
        }

        return {
          success: true,
          message: `Unit ${unitCallsign} successfully dispatched to Incident ${payload.incidentId}`,
          incidentId: payload.incidentId,
          unitId: payload.unitId,
          assignedTimestamp: new Date().toISOString(),
          etaMinutes: 6
        };
      }
      throw err;
    }
  },

  // Update incident status
  async updateIncidentStatus(incidentId: string, status: Incident['status']): Promise<Incident> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(`Update status failed: ${response.status}`);
      const updated = await response.json();
      return normalizeBackendIncident(updated);
    } catch (err) {
      if (ENABLE_MOCK_FALLBACK) {
        const idx = localIncidents.findIndex(i => i.id === incidentId);
        if (idx !== -1) {
          localIncidents[idx].status = status;
          return localIncidents[idx];
        }
        throw new Error('Incident not found');
      }
      throw err;
    }
  },

  // Update resource status
  async updateResourceStatus(resourceId: string, status: ResourceUnit['status'], lat?: number, lng?: number): Promise<ResourceUnit> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/resources/${resourceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status.charAt(0) + status.slice(1).toLowerCase(),
          latitude: lat,
          longitude: lng
        })
      });
      if (!response.ok) throw new Error(`Update resource failed: ${response.status}`);
      const updated = await response.json();
      return normalizeBackendResource(updated);
    } catch (err) {
      if (ENABLE_MOCK_FALLBACK) {
        const idx = localUnits.findIndex(u => u.id === resourceId);
        if (idx !== -1) {
          localUnits[idx].status = status;
          return localUnits[idx];
        }
      }
      throw err;
    }
  },

  // Create new incident
  async createIncident(incident: Partial<Incident>): Promise<Incident> {
    try {
      const payload = {
        title: incident.title || 'Emergency Incident',
        description: incident.aiSummary || incident.title || '',
        emergency_type: incident.type ? (incident.type === 'ACCIDENT' ? 'Road Accident' : incident.type.charAt(0) + incident.type.slice(1).toLowerCase()) : 'General',
        severity: incident.severity ? incident.severity.charAt(0) + incident.severity.slice(1).toLowerCase() : 'Medium',
        latitude: incident.location?.lat || 19.0760,
        longitude: incident.location?.lng || 72.8777,
        location_name: incident.location?.address || 'Metro Sector',
        required_capabilities: incident.requiredCapabilities || []
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Create incident failed: ${response.status}`);
      const data = await response.json();
      const norm = normalizeBackendIncident(data);
      localIncidents.unshift(norm);
      return norm;
    } catch (err) {
      if (ENABLE_MOCK_FALLBACK) {
        const fullInc: Incident = {
          id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          title: incident.title || 'Manual Emergency Incident',
          type: incident.type || 'FIRE',
          severity: incident.severity || 'HIGH',
          status: 'PENDING',
          location: incident.location || { lat: 19.0760, lng: 72.8777, address: 'Metro Mumbai' },
          timestamp: new Date().toISOString(),
          source: incident.source || 'CITIZEN_APP',
          duplicateCount: 0,
          aiSummary: incident.aiSummary || 'Incident created by operator.',
          riskScore: 80,
          requiredCapabilities: incident.requiredCapabilities || ['Fire Suppression'],
          slaMinutesRemaining: 15
        };
        localIncidents.unshift(fullInc);
        return fullInc;
      }
      throw err;
    }
  },

  // Submit citizen report
  async submitCitizenReport(report: {
    raw_text: string;
    latitude: number;
    longitude: number;
    source?: string;
    reporter_name?: string;
    reporter_contact?: string;
  }): Promise<Incident> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/incidents/reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: report.raw_text,
          latitude: report.latitude,
          longitude: report.longitude,
          source: report.source || 'citizen_web',
          reporter_name: report.reporter_name,
          reporter_contact: report.reporter_contact
        })
      });
      if (!response.ok) throw new Error(`Report submit failed: ${response.status}`);
      const data = await response.json();
      if (data.incident_id) {
        const incRes = await fetch(`${API_BASE_URL}/api/v1/incidents/${data.incident_id}`);
        if (incRes.ok) {
          return normalizeBackendIncident(await incRes.json());
        }
      }
      // Return synthetic incident if immediate fetch not ready
      return normalizeBackendIncident({
        id: data.incident_id || Date.now(),
        title: `Citizen SOS: ${report.raw_text.slice(0, 40)}`,
        emergency_type: 'General',
        severity: 'High',
        latitude: report.latitude,
        longitude: report.longitude,
        description: report.raw_text
      });
    } catch (err) {
      if (ENABLE_MOCK_FALLBACK) {
        const newInc: Incident = {
          id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          title: `Citizen Emergency SOS Report`,
          type: 'FIRE',
          severity: 'HIGH',
          status: 'PENDING',
          location: { lat: report.latitude, lng: report.longitude, address: 'Reported Location' },
          timestamp: new Date().toISOString(),
          source: 'CITIZEN_APP',
          duplicateCount: 1,
          aiSummary: report.raw_text,
          riskScore: 82,
          requiredCapabilities: ['Rapid Response'],
          slaMinutesRemaining: 12
        };
        localIncidents.unshift(newInc);
        return newInc;
      }
      throw err;
    }
  },

  // Trigger Demo Scenario in Backend
  async triggerScenario(code: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/simulation/trigger-scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_code: code })
      });
      if (!response.ok) throw new Error(`Scenario trigger failed: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn('Backend scenario trigger error:', err);
      return null;
    }
  },

  // Fetch Operations Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/analytics`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data as AnalyticsData;
    } catch (err) {
      if (ENABLE_MOCK_FALLBACK) {
        return {
          ...INITIAL_ANALYTICS,
          activeIncidents: localIncidents.filter(i => i.status !== 'RESOLVED').length,
          availableUnits: localUnits.filter(u => u.status === 'AVAILABLE').length,
          dispatchedUnits: localUnits.filter(u => u.status === 'DISPATCHED' || u.status === 'EN_ROUTE').length,
        };
      }
      throw err;
    }
  }
};
