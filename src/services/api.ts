import { Incident, ResourceUnit, DispatchPayload, DispatchResponse, AnalyticsData, DispatchRecommendation } from '../types/emergency';
import { INITIAL_INCIDENTS, INITIAL_RESOURCE_UNITS, INITIAL_ANALYTICS, calculateMockRecommendations } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false';

// Memory store for local state updates when running in mock fallback mode
let localIncidents: Incident[] = [...INITIAL_INCIDENTS];
let localUnits: ResourceUnit[] = [...INITIAL_RESOURCE_UNITS];

export const emergencyApi = {
  // Fetch all active & recent incidents
  async getIncidents(): Promise<Incident[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/incidents`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
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
      return await response.json();
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
      return await response.json();
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
      return await response.json();
    } catch (err) {
      if (ENABLE_MOCK_FALLBACK) {
        console.log('[Mock API] Executing Unit Dispatch:', payload);
        
        // Update local unit state
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

        // Update local incident state
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
      return await response.json();
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

  // Fetch Operations Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/analytics`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
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
