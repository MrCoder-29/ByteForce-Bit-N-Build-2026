import { WebSocketMessage, Incident, ResourceUnit, AlertNotice } from '../types/emergency';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/hq';

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
      this.socket = new WebSocket(WS_URL);

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
          const data: WebSocketMessage = JSON.parse(event.data);
          this.notifyHandlers(data);
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
        // Auto reconnect every 5s if not in simulation mode
        if (!this.isSimulating) {
          this.reconnectTimer = setTimeout(() => this.connect(), 5000);
        }
      };
    } catch (e) {
      console.warn('[WebSocket HQ] WebSockets unavailable. Auto-enabling simulator.');
    }
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
          unitId: "UNIT-FIRE-01",
          callsign: "Heavy Rescue Engine 05",
          status: "DISPATCHED",
          location: { lat: 19.1100, lng: 72.8460, address: "En route via WEH" }
        }
      });
    } else {
      const alert: AlertNotice = {
        id: `ALT-${Math.floor(Math.random() * 1000)}`,
        type: "ESCALATION",
        title: "AUTOMATED ESCALATION ALERT",
        message: "Chemical Spill Incident INC-2026-8801 risk score escalated due to wind speed changes.",
        timestamp: now,
        incidentId: "INC-2026-8801",
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
