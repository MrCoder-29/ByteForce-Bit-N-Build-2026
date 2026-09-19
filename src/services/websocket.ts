import { WebSocketMessage, Incident, ResourceUnit, AlertNotice } from '../types/emergency';
import { normalizeBackendIncident } from './api';

export const getWsUrl = (): string => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  if (typeof window !== 'undefined' && window.location) {
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use window.location.host so Vite proxies /ws/hq on host machine regardless of client IP
    return `${wsProto}//${window.location.host}/ws/hq`;
  }
  return 'ws://localhost:8000/ws/hq';
};

export type WSHandler = (msg: WebSocketMessage) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private handlers: Set<WSHandler> = new Set();
  private isConnected: boolean = false;
  private isSimulating: boolean = false;
  private simInterval: any = null;
  private reconnectTimer: any = null;

  public connect() {
    if (this.socket || this.isSimulating) return;

    try {
      const url = getWsUrl();
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('[WebSocket HQ] Connected to Emergency HQ WS Server');
        this.isConnected = true;
        this.notifyHandlers({
          event: 'SYSTEM_HEARTBEAT',
          timestamp: new Date().toISOString(),
          payload: { status: 'ONLINE', message: 'WebSocket Connected to Server' }
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          const messages = this.normalizeIncomingMessages(raw);
          messages.forEach((msg) => this.notifyHandlers(msg));
        } catch (e) {
          console.error('[WebSocket HQ] Failed to parse message', e);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[WebSocket HQ] Connection error. Will attempt reconnect.', err);
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.socket = null;
        console.log('[WebSocket HQ] Connection closed.');
        // Auto reconnect every 4s if not in simulation mode
        if (!this.isSimulating) {
          this.reconnectTimer = setTimeout(() => this.connect(), 4000);
        }
      };
    } catch (e) {
      console.warn('[WebSocket HQ] WebSockets unavailable. Auto-enabling simulator.');
    }
  }

  private normalizeIncomingMessages(raw: any): WebSocketMessage[] {
    const ts = raw.timestamp || new Date().toISOString();
    const event = raw.event;
    const data = raw.data || raw.payload || {};

    // 1. New Incident created
    if (event === 'incident_created' || event === 'INCIDENT_NEW') {
      return [{
        event: 'INCIDENT_NEW',
        timestamp: ts,
        payload: normalizeBackendIncident(data)
      }];
    }

    // 2. Incident status or sitrep updated
    if (event === 'incident_updated' || event === 'INCIDENT_UPDATE') {
      return [{
        event: 'INCIDENT_UPDATE',
        timestamp: ts,
        payload: normalizeBackendIncident(data)
      }];
    }

    // 3. Responder status or GPS changed
    if (event === 'responder_status_changed' || event === 'UNIT_STATUS_CHANGE') {
      const statusMap: Record<string, string> = {
        Available: 'AVAILABLE',
        Dispatched: 'DISPATCHED',
        'En Route': 'EN_ROUTE',
        'On Scene': 'ON_SCENE',
        Maintenance: 'MAINTENANCE',
        Offline: 'OFFLINE'
      };
      const rawStatus = data.new_status || data.status || 'AVAILABLE';
      const status = statusMap[rawStatus] || String(rawStatus).toUpperCase();

      return [{
        event: 'UNIT_STATUS_CHANGE',
        timestamp: ts,
        payload: {
          unitId: String(data.resource_id || data.identifier || data.unitId),
          status,
          location: data.latitude ? { lat: data.latitude, lng: data.longitude, address: data.name || 'Field Unit' } : data.location
        }
      }];
    }

    // 4. Resource dispatched
    if (event === 'resource_dispatched' || event === 'UNIT_DISPATCHED') {
      return [
        {
          event: 'UNIT_STATUS_CHANGE',
          timestamp: ts,
          payload: {
            unitId: String(data.resource_id || data.resource_identifier || data.unitId),
            status: 'DISPATCHED',
            currentIncidentId: String(data.incident_id)
          }
        }
      ];
    }

    // 5. SLA Escalation Alert
    if (event === 'sla_escalation' || event === 'ESCALATION_ALERT') {
      const alert: AlertNotice = {
        id: `ALT-${Date.now()}`,
        type: 'ESCALATION',
        title: 'AUTOMATED SLA ESCALATION WARNING',
        message: data.message || `Incident #${data.incident_id} unassigned for > ${data.elapsed_seconds || 90}s!`,
        timestamp: ts,
        incidentId: String(data.incident_id || ''),
        severity: 'CRITICAL',
        acknowledged: false
      };
      return [{
        event: 'ESCALATION_ALERT',
        timestamp: ts,
        payload: alert
      }];
    }

    // 6. Generic or heartbeat passthrough
    if (event === 'SYSTEM_HEARTBEAT') {
      return [{ event: 'SYSTEM_HEARTBEAT', timestamp: ts, payload: data }];
    }

    return [];
  }

  public subscribe(handler: WSHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  private notifyHandlers(msg: WebSocketMessage) {
    this.handlers.forEach((h) => h(msg));
  }

  public getStatus(): { isConnected: boolean; isSimulating: boolean } {
    return { isConnected: this.isConnected, isSimulating: this.isSimulating };
  }

  // --- Live Event Simulator ---
  public toggleSimulation(enable?: boolean): boolean {
    this.isSimulating = enable !== undefined ? enable : !this.isSimulating;

    if (this.isSimulating) {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

      console.log('[Simulator] Live Emergency Event Simulation ENABLED.');
      this.notifyHandlers({
        event: 'SYSTEM_HEARTBEAT',
        timestamp: new Date().toISOString(),
        payload: { status: 'SIMULATING', message: 'Live Simulation Mode Active' }
      });

      // Start periodic simulated events
      this.simInterval = setInterval(() => {
        this.triggerSimulatedEvent();
      }, 12000); // Trigger event every 12s
    } else {
      if (this.simInterval) clearInterval(this.simInterval);
      console.log('[Simulator] Live Emergency Event Simulation DISABLED.');
      this.connect();
    }

    return this.isSimulating;
  }

  // Trigger manual simulated event from UI simulator bar
  public triggerSimulatedEvent(eventType?: 'NEW_INCIDENT' | 'UNIT_UPDATE' | 'ESCALATION') {
    const types: ('NEW_INCIDENT' | 'UNIT_UPDATE' | 'ESCALATION')[] = ['NEW_INCIDENT', 'UNIT_UPDATE', 'ESCALATION'];
    const chosen = eventType || types[Math.floor(Math.random() * types.length)];

    const now = new Date().toISOString();

    if (chosen === 'NEW_INCIDENT') {
      const incId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInc: Incident = {
        id: incId,
        title: "Reported Structural Collapse near Metro Construction",
        type: "STRUCTURAL",
        severity: "CRITICAL",
        status: "PENDING",
        location: {
          lat: 19.1000 + (Math.random() - 0.5) * 0.05,
          lng: 72.8500 + (Math.random() - 0.5) * 0.05,
          address: "Metro Line 3 Construction Site, Marol",
          cityZone: "North Zone"
        },
        timestamp: now,
        source: "DRONE_FEED",
        duplicateCount: 4,
        aiSummary: "Drone camera identified concrete debris fall and trapped construction worker. Immediate heavy rescue & hydraulic extrication required.",
        riskScore: 91,
        requiredCapabilities: ["Heavy Hydraulic Extrication", "Trauma Transport"],
        slaMinutesRemaining: 5,
        notes: ["Live drone feed broadcasting to Command HQ"]
      };

      this.notifyHandlers({
        event: 'INCIDENT_NEW',
        timestamp: now,
        payload: newInc
      });
    } else if (chosen === 'UNIT_UPDATE') {
      this.notifyHandlers({
        event: 'UNIT_STATUS_CHANGE',
        timestamp: now,
        payload: {
          unitId: "FIRE-202",
          callsign: "Heavy Engine 2",
          status: "DISPATCHED",
          location: { lat: 19.1100, lng: 72.8460, address: "En route via WEH" }
        }
      });
    } else {
      const alert: AlertNotice = {
        id: `ALT-${Math.floor(Math.random() * 1000)}`,
        type: "ESCALATION",
        title: "AUTOMATED ESCALATION ALERT",
        message: "Active high priority emergency unassigned. SLA threshold approaching limit.",
        timestamp: now,
        severity: "CRITICAL",
        acknowledged: false
      };

      this.notifyHandlers({
        event: 'ESCALATION_ALERT',
        timestamp: now,
        payload: alert
      });
    }
  }
}

export const wsService = new WebSocketService();
