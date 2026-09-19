import { DEMO_SCENARIOS, INITIAL_RESPONDER_PROFILE } from '../data/mockScenarios';
import { soundEffects } from './soundEffects';

class ApiService {
  constructor() {
    this.baseUrl = typeof window !== 'undefined' && window.__EMERGENCY_API_URL__ 
      ? window.__EMERGENCY_API_URL__ 
      : (import.meta.env?.VITE_API_URL || 'http://localhost:8000');
    this.isMockMode = true; // Auto-detected or forced
    this.backendChecked = false;
    this.subscribers = new Set();
    
    // In-memory reactive store for resilient hackathon demo
    this.mockStore = {
      incidents: [],
      activeDispatch: null,
      responderProfile: { ...INITIAL_RESPONDER_PROFILE },
      notifications: [],
      eventLog: []
    };

    this.initMockStore();
    this.detectBackend();
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      window.__EMERGENCY_API_URL__ = this.baseUrl;
    }
    this.detectBackend();
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  async detectBackend() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      
      const response = await fetch(`${this.baseUrl}/api/v1/health`, {
        signal: controller.signal
      }).catch(() => null);
      
      clearTimeout(timeoutId);

      if (response && response.ok) {
        this.isMockMode = false;
        this.logSystemEvent('BACKEND_CONNECTED', `Connected to live backend at ${this.baseUrl}`);
      } else {
        this.isMockMode = true;
        this.logSystemEvent('MOCK_ADAPTER_ACTIVE', `Backend at ${this.baseUrl} unreachable. Running in resilient mock mode.`);
      }
    } catch {
      this.isMockMode = true;
      this.logSystemEvent('MOCK_ADAPTER_ACTIVE', `Backend offline. Running in zero-failure mock mode.`);
    }
    this.backendChecked = true;
    this.notifySubscribers('CONNECTION_CHANGED', { isMockMode: this.isMockMode, url: this.baseUrl });
  }

  initMockStore() {
    // Seed initial active dispatch for immediate demonstration
    const initialScenario = DEMO_SCENARIOS.chemical_fire;
    const initialIncident = {
      id: 'INC-2026-091',
      title: initialScenario.name,
      category: initialScenario.category,
      severity: initialScenario.severity,
      severityScore: 5,
      status: 'DISPATCHED', // DISPATCHED, EN_ROUTE, ON_SCENE, RESOLVED
      location: initialScenario.location,
      description: initialScenario.description,
      reportedAt: new Date(Date.now() - 4 * 60000).toISOString(),
      reporter: 'Plant Security & 3 Citizen Pings',
      mergedReportsCount: 4,
      aiTriage: {
        summary: 'Catastrophic solvent fire at storage tank dock with vapor cloud formation. High potential for chlorine tank breach.',
        confidence: 0.98,
        requiredCapabilities: ['Level-B SCBA', 'Class-B Foam', 'HAZMAT Containment', 'Thermal Drone'],
        estimatedCasualties: '2-4 workers unaccounted for'
      },
      assignedResources: initialScenario.recommendedResources,
      tacticalSop: initialScenario.tacticalSop.map(s => ({ ...s }))
    };

    this.mockStore.incidents.push(initialIncident);
    this.mockStore.activeDispatch = initialIncident;
    this.mockStore.responderProfile.status = 'DISPATCHED';
  }

  // Pub/Sub for real-time reactivity
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(eventType, data) {
    this.subscribers.forEach(cb => {
      try {
        cb(eventType, data);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }

  logSystemEvent(type, message, payload = null) {
    const entry = {
      id: 'LOG-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      payload
    };
    this.mockStore.eventLog.unshift(entry);
    if (this.mockStore.eventLog.length > 50) this.mockStore.eventLog.pop();
    this.notifySubscribers('EVENT_LOG_UPDATED', entry);
  }

  addNotification(title, message, type = 'info') {
    const notif = {
      id: 'NOTIF-' + Date.now(),
      title,
      message,
      type, // 'dispatch', 'alert', 'escalation', 'success'
      timestamp: new Date().toLocaleTimeString()
    };
    this.mockStore.notifications.unshift(notif);
    this.notifySubscribers('NEW_NOTIFICATION', notif);

    if (type === 'dispatch' || type === 'alert') {
      soundEffects.playDispatchChime();
    } else if (type === 'escalation') {
      soundEffects.playEmergencySiren();
    } else if (type === 'success') {
      soundEffects.playSuccessPing();
    }
    return notif;
  }

  // 1. Ingestion: Citizen Emergency Report
  async submitCitizenReport(reportData) {
    const payload = {
      source: 'CITIZEN_WEB',
      category: reportData.category,
      description: reportData.description,
      location: {
        address: reportData.address || 'Reported Location',
        latitude: reportData.latitude || 40.7128,
        longitude: reportData.longitude || -74.0060
      },
      casualtiesCount: reportData.casualtiesCount || 0,
      hasMedia: Boolean(reportData.mediaUrl),
      voiceTranscript: reportData.voiceTranscript || null,
      submittedAt: new Date().toISOString()
    };

    this.logSystemEvent('CITIZEN_REPORT_SUBMITTED', `New citizen report for ${payload.category}`, payload);

    if (!this.isMockMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/incidents/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          this.addNotification('Citizen Report Ingested', `Report registered as incident #${data.incident_id || data.id}`, 'success');
          return data;
        }
      } catch (err) {
        console.warn('Backend submission failed, falling back to mock adapter', err);
      }
    }

    // Mock Adapter: Process & Create Incident
    const mockRefId = 'SOS-' + Math.floor(10000 + Math.random() * 90000);
    const mockIncident = {
      id: mockRefId,
      title: `${reportData.category.toUpperCase()} at ${payload.location.address}`,
      category: reportData.category,
      severity: reportData.severity || 'HIGH',
      severityScore: 4,
      status: 'DISPATCHED',
      location: {
        address: payload.location.address,
        coordinates: [payload.location.latitude, payload.location.longitude]
      },
      description: payload.description,
      reportedAt: new Date().toISOString(),
      reporter: 'Citizen (Direct Ingest)',
      mergedReportsCount: 1,
      aiTriage: {
        summary: `Citizen reports active ${reportData.category} incident: ${payload.description}`,
        confidence: 0.94,
        requiredCapabilities: ['Rapid Response', 'Field First Aid', 'Scene Assessment'],
        estimatedCasualties: reportData.casualtiesCount > 0 ? `${reportData.casualtiesCount} reported` : 'Unknown'
      },
      assignedResources: [
        { unitId: 'ENGINE-7', name: 'Engine 7 Fire & Hazmat Crew', type: 'Primary Responder', eta: '3 mins', distance: '1.4 km' }
      ],
      tacticalSop: [
        { id: 1, text: 'Confirm location and secure immediate perimeter', completed: false },
        { id: 2, text: 'Perform visual size-up and report secondary hazards to Dispatch', completed: false },
        { id: 3, text: 'Triage injured parties and establish EMS collection point', completed: false }
      ]
    };

    this.mockStore.incidents.unshift(mockIncident);
    this.mockStore.activeDispatch = mockIncident;
    this.mockStore.responderProfile.status = 'DISPATCHED';

    this.addNotification('🚨 New Emergency Dispatch Assigned', `Unit Engine-7 assigned to ${mockIncident.title}`, 'dispatch');
    this.notifySubscribers('INCIDENT_CREATED', mockIncident);
    this.notifySubscribers('ACTIVE_DISPATCH_UPDATED', mockIncident);

    return {
      success: true,
      referenceId: mockRefId,
      incident: mockIncident,
      message: 'Emergency report transmitted and dispatched to nearest responders.'
    };
  }

  // 2. Ingestion: Sensor Telemetry Alert
  async sendSensorTelemetry(sensorReading) {
    const payload = {
      source: 'IOT_SENSOR',
      sensor_id: sensorReading.sensorId,
      sensor_type: sensorReading.sensorType,
      metric_name: sensorReading.metric,
      value: sensorReading.value,
      threshold: sensorReading.threshold,
      is_anomaly: true,
      timestamp: new Date().toISOString(),
      location: sensorReading.location
    };

    this.logSystemEvent('SENSOR_ALERT_INGESTED', `Sensor ${sensorReading.sensorId} breached threshold (${sensorReading.value})`, payload);

    if (!this.isMockMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/sensors/telemetry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend sensor post failed, using mock', err);
      }
    }

    this.addNotification('⚠️ Sensor Anomaly Triggered', `${sensorReading.sensorId}: ${sensorReading.metric} spike detected (${sensorReading.value})`, 'alert');
    return { success: true, payload };
  }

  // 3. Trigger Full Hackathon Demo Scenario (Scenario A, B, or C)
  async triggerDemoScenario(scenarioKey) {
    const scenario = DEMO_SCENARIOS[scenarioKey];
    if (!scenario) return false;

    this.logSystemEvent('SCENARIO_TRIGGERED', `Initiated Demo Scenario: ${scenario.name}`);

    // Create consolidated incident
    const incidentId = 'INC-' + Math.floor(1000 + Math.random() * 9000);
    const consolidatedIncident = {
      id: incidentId,
      title: scenario.name,
      category: scenario.category,
      severity: scenario.severity,
      severityScore: scenario.severity === 'CRITICAL' ? 5 : 4,
      status: 'DISPATCHED',
      location: scenario.location,
      description: scenario.description,
      reportedAt: new Date().toISOString(),
      reporter: `Multi-Source Cluster (${scenario.events.length} incoming alerts)`,
      mergedReportsCount: scenario.events.length,
      aiTriage: {
        summary: `AI Multi-Source Correlation: Consolidated ${scenario.events.length} convergent reports within 300m radius. High correlation coefficient (0.97).`,
        confidence: 0.97,
        requiredCapabilities: scenario.category.includes('HAZMAT') 
          ? ['Level-B SCBA', 'Class-B Foam', 'Atmospheric Monitoring']
          : scenario.category.includes('Flood')
          ? ['Swift-Water Boat', 'PFD Flotation', 'Technical Rescue']
          : ['Hydraulic Cutters', 'ALS Trauma Paramedics', 'Hazardous Clean'],
        estimatedCasualties: 'Multiple trapped / at risk'
      },
      assignedResources: scenario.recommendedResources,
      tacticalSop: scenario.tacticalSop.map(s => ({ ...s }))
    };

    // Forward events to backend if online
    if (!this.isMockMode) {
      for (const ev of scenario.events) {
        fetch(`${this.baseUrl}/api/v1/incidents/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ev)
        }).catch(err => console.warn('Failed to forward scenario event:', err));
      }
    }

    // Update internal state
    this.mockStore.incidents.unshift(consolidatedIncident);
    this.mockStore.activeDispatch = consolidatedIncident;
    this.mockStore.responderProfile.status = 'DISPATCHED';

    this.addNotification(
      `🚨 DISPATCH: ${scenario.name}`,
      `Priority ${scenario.severity} incident assigned to ${this.mockStore.responderProfile.unitName}`,
      scenario.severity === 'CRITICAL' ? 'escalation' : 'dispatch'
    );

    this.notifySubscribers('SCENARIO_LOADED', consolidatedIncident);
    this.notifySubscribers('ACTIVE_DISPATCH_UPDATED', consolidatedIncident);

    return consolidatedIncident;
  }

  // 4. Responder Lifecycle Updates (Acknowledge, Arrive, Resolve)
  async updateResponderStatus(incidentId, newStatus) {
    this.mockStore.responderProfile.status = newStatus;
    
    if (this.mockStore.activeDispatch && this.mockStore.activeDispatch.id === incidentId) {
      this.mockStore.activeDispatch.status = newStatus;
    }

    const payload = {
      incident_id: incidentId,
      unit_id: this.mockStore.responderProfile.unitId,
      status: newStatus,
      timestamp: new Date().toISOString(),
      coordinates: this.mockStore.responderProfile.currentCoordinates
    };

    this.logSystemEvent('RESPONDER_STATUS_CHANGED', `Unit ${this.mockStore.responderProfile.unitId} status -> ${newStatus}`, payload);

    if (!this.isMockMode) {
      try {
        await fetch(`${this.baseUrl}/api/v1/responder/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Backend status update failed, handled locally', err);
      }
    }

    // Play radio chirp audio feedback
    soundEffects.playRadioChirp();

    if (newStatus === 'EN_ROUTE') {
      this.addNotification('Unit En Route', `${this.mockStore.responderProfile.unitName} acknowledged and rolling`, 'info');
    } else if (newStatus === 'ON_SCENE') {
      this.addNotification('Unit Arrived On Scene', `${this.mockStore.responderProfile.unitName} marked on-scene at incident #${incidentId}`, 'info');
    } else if (newStatus === 'RESOLVED') {
      this.addNotification('Incident Resolved', `Incident #${incidentId} marked resolved. Unit returned to available.`, 'success');
      this.mockStore.responderProfile.status = 'AVAILABLE';
    }

    this.notifySubscribers('STATUS_UPDATED', { incidentId, status: newStatus });
    return { success: true, status: newStatus };
  }

  // Toggle tactical SOP task checkmark
  toggleSopTask(taskId) {
    if (!this.mockStore.activeDispatch || !this.mockStore.activeDispatch.tacticalSop) return;
    const task = this.mockStore.activeDispatch.tacticalSop.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      soundEffects.playRadioChirp();
      this.notifySubscribers('ACTIVE_DISPATCH_UPDATED', this.mockStore.activeDispatch);
    }
  }

  getActiveDispatch() {
    return this.mockStore.activeDispatch;
  }

  getResponderProfile() {
    return this.mockStore.responderProfile;
  }

  getEventLog() {
    return this.mockStore.eventLog;
  }

  getNotifications() {
    return this.mockStore.notifications;
  }
}

export const apiService = new ApiService();
