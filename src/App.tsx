import React, { useState, useEffect } from 'react';
import { Incident, ResourceUnit, AlertNotice, AnalyticsData, WebSocketMessage } from './types/emergency';
import { emergencyApi } from './services/api';
import { wsService } from './services/websocket';
import { INITIAL_ALERTS, INITIAL_ANALYTICS } from './services/mockData';
import { Header } from './components/Header';
import { QuickStatsBar } from './components/Stats/QuickStatsBar';
import { PriorityActionsPanel } from './components/Incidents/PriorityActionsPanel';
import { LiveSimulatorBar } from './components/LiveSimulatorBar';
import { CommandMap } from './components/Map/CommandMap';
import { IncidentFeed } from './components/Incidents/IncidentFeed';
import { IncidentDetailDrawer } from './components/Incidents/IncidentDetailDrawer';
import { DispatchModal } from './components/Dispatch/DispatchModal';
import { AlertCenter } from './components/Alerts/AlertCenter';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { ResourceFleetPanel } from './components/Resources/ResourceFleetPanel';
import { ResponderPWA } from './components/Responder/ResponderPWA';
import { CitizenReportPortal } from './components/Citizen/CitizenReportPortal';
import { CreateIncidentModal } from './components/Incidents/CreateIncidentModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MAP' | 'FEED' | 'ANALYTICS' | 'RESPONDER' | 'CITIZEN'>('MAP');
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('hq_theme') as 'dark' | 'light') || 'dark'
  );

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [units, setUnits] = useState<ResourceUnit[]>([]);
  const [alerts, setAlerts] = useState<AlertNotice[]>(INITIAL_ALERTS);
  const [analytics, setAnalytics] = useState<AnalyticsData>(INITIAL_ANALYTICS);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [dispatchIncident, setDispatchIncident] = useState<Incident | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [wsStatus, setWsStatus] = useState<{ isConnected: boolean; isSimulating: boolean }>({
    isConnected: false,
    isSimulating: false,
  });

  // Toggle theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('hq_theme', nextTheme);
  };

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incData, unitData, analyticsData] = await Promise.all([
          emergencyApi.getIncidents(),
          emergencyApi.getResources(),
          emergencyApi.getAnalytics(),
        ]);

        setIncidents(incData);
        setUnits(unitData);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Error loading initial command data:', err);
      }
    };

    fetchData();

    // Connect WebSocket / Simulator
    wsService.connect();
    setWsStatus(wsService.getStatus());

    // Subscribe to live events
    const unsubscribe = wsService.subscribe((msg: WebSocketMessage) => {
      handleWebSocketMessage(msg);
      setWsStatus(wsService.getStatus());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle incoming real-time WebSocket events
  const handleWebSocketMessage = (msg: WebSocketMessage) => {
    console.log('[HQ Event Received]', msg);

    if (msg.event === 'INCIDENT_NEW') {
      const newInc: Incident = msg.payload;
      setIncidents((prev) => {
        if (prev.some((i) => i.id === newInc.id)) return prev;
        return [newInc, ...prev];
      });
      emergencyApi.getAnalytics().then(setAnalytics).catch(() => null);

      // Add to alerts if critical
      if (newInc.severity === 'CRITICAL' || newInc.severity === 'HIGH') {
        const newAlert: AlertNotice = {
          id: `ALT-${Date.now()}`,
          type: 'CRITICAL_INCIDENT',
          title: `NEW ${newInc.severity} EMERGENCY REPORTED`,
          message: `${newInc.title} at ${newInc.location.address}`,
          timestamp: newInc.timestamp,
          incidentId: newInc.id,
          severity: newInc.severity,
          acknowledged: false,
        };
        setAlerts((prev) => [newAlert, ...prev]);
      }
    } else if (msg.event === 'INCIDENT_UPDATE') {
      const updatedInc: Incident = msg.payload;
      setIncidents((prev) => prev.map((inc) => (inc.id === updatedInc.id ? updatedInc : inc)));
      emergencyApi.getAnalytics().then(setAnalytics).catch(() => null);
    } else if (msg.event === 'UNIT_STATUS_CHANGE') {
      const { unitId, status, location } = msg.payload;
      setUnits((prev) =>
        prev.map((u) => (u.id === unitId ? { ...u, status, location: location || u.location } : u))
      );
    } else if (msg.event === 'ESCALATION_ALERT') {
      const alert: AlertNotice = msg.payload;
      setAlerts((prev) => [alert, ...prev]);
    }
  };

  const handleToggleSimulator = () => {
    const isNowSimulating = wsService.toggleSimulation();
    setWsStatus(wsService.getStatus());
  };

  const handleDispatchSuccess = (incidentId: string, unitId: string) => {
    // Refresh incidents & resources from API / mock store
    emergencyApi.getIncidents().then(setIncidents);
    emergencyApi.getResources().then(setUnits);
    emergencyApi.getAnalytics().then(setAnalytics);

    // Keep selected incident updated
    setIncidents((prev) => {
      const updated = prev.find((i) => i.id === incidentId);
      if (updated) setSelectedIncident(updated);
      return prev;
    });
  };

  const handleUpdateStatus = async (incidentId: string, status: Incident['status']) => {
    try {
      const updated = await emergencyApi.updateIncidentStatus(incidentId, status);
      setIncidents((prev) => prev.map((i) => (i.id === incidentId ? updated : i)));
      if (selectedIncident?.id === incidentId) setSelectedIncident(updated);
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleUpdateUnitStatus = (unitId: string, status: ResourceUnit['status']) => {
    emergencyApi.updateResourceStatus(unitId, status).catch((err) => {
      console.warn('Backend unit status update warning:', err);
    });
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, status } : u))
    );
  };

  const handleCitizenReportSubmitted = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);

    const newAlert: AlertNotice = {
      id: `ALT-${Date.now()}`,
      type: 'CRITICAL_INCIDENT',
      title: 'CITIZEN SOS EMERGENCY SUBMITTED',
      message: `${newIncident.title} (${newIncident.location.address})`,
      timestamp: newIncident.timestamp,
      incidentId: newIncident.id,
      severity: newIncident.severity,
      acknowledged: false,
    };

    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleCreateIncident = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);

    if (newIncident.severity === 'CRITICAL' || newIncident.severity === 'HIGH') {
      const newAlert: AlertNotice = {
        id: `ALT-${Date.now()}`,
        type: 'CRITICAL_INCIDENT',
        title: `MANUAL ${newIncident.severity} TEST INCIDENT CREATED`,
        message: `${newIncident.title} (${newIncident.location.address})`,
        timestamp: newIncident.timestamp,
        incidentId: newIncident.id,
        severity: newIncident.severity,
        acknowledged: false,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
  };

  const handleSelectIncidentById = (id: string) => {
    const found = incidents.find((i) => i.id === id);
    if (found) {
      setSelectedIncident(found);
      setActiveTab('MAP');
    }
  };

  const unacknowledgedAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${theme === 'light' ? 'bg-slate-950 text-slate-100' : 'bg-[#090d16] text-slate-100'}`}>
      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        incidents={incidents}
        units={units}
        activeIncidentsCount={incidents.filter((i) => i.status !== 'RESOLVED').length}
        criticalAlertsCount={unacknowledgedAlertsCount}
        wsConnected={wsStatus.isConnected}
        wsSimulating={wsStatus.isSimulating}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToggleSimulator={handleToggleSimulator}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onSelectIncident={(inc) => {
          setSelectedIncident(inc);
          setActiveTab('MAP');
        }}
        onSelectUnit={() => {
          setActiveTab('ANALYTICS');
        }}
        onFilterCritical={() => setActiveTab('FEED')}
        onFilterDelayed={() => setActiveTab('FEED')}
        onFilterAvailable={() => setActiveTab('ANALYTICS')}
      />

      {/* Top Quick Statistics Bar */}
      <QuickStatsBar
        incidents={incidents}
        units={units}
        onFilterCritical={() => setActiveTab('FEED')}
        onFilterDelayed={() => setActiveTab('FEED')}
        onFilterAvailable={() => setActiveTab('ANALYTICS')}
      />

      {/* Real-time Simulator Bar with SIH Guided Demo Flow */}
      <LiveSimulatorBar
        isSimulating={wsStatus.isSimulating}
        onToggleSimulator={handleToggleSimulator}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col overflow-hidden relative p-3 gap-3">
        {activeTab === 'MAP' && (
          <div className="flex-1 flex flex-col gap-3 h-full overflow-hidden">
            {/* Priority Actions Surface Bar */}
            <PriorityActionsPanel
              incidents={incidents}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              onOpenDispatchModal={(inc) => setDispatchIncident(inc)}
            />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 h-full overflow-hidden">
              {/* Map Area (8 Columns on desktop) */}
              <div className="lg:col-span-8 h-full min-h-[400px]">
                <CommandMap
                  incidents={incidents}
                  units={units}
                  selectedIncident={selectedIncident}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                  onOpenDispatchModal={(inc) => setDispatchIncident(inc)}
                />
              </div>

              {/* Side Incident Feed (4 Columns on desktop) */}
              <div className="lg:col-span-4 h-full overflow-hidden">
                <IncidentFeed
                  incidents={incidents}
                  selectedIncident={selectedIncident}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                  onOpenDispatchModal={(inc) => setDispatchIncident(inc)}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FEED' && (
          <div className="w-full h-full max-w-5xl mx-auto">
            <IncidentFeed
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              onOpenDispatchModal={(inc) => setDispatchIncident(inc)}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'ANALYTICS' && (
          <div className="w-full h-full rounded-2xl overflow-y-auto space-y-4">
            <ResourceFleetPanel units={units} onSelectUnit={() => {}} />
            <AnalyticsDashboard analytics={analytics} />
          </div>
        )}

        {activeTab === 'RESPONDER' && (
          <ResponderPWA
            units={units}
            incidents={incidents}
            onUpdateUnitStatus={handleUpdateUnitStatus}
            onUpdateIncidentStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'CITIZEN' && (
          <CitizenReportPortal
            onReportSubmitted={handleCitizenReportSubmitted}
          />
        )}
      </main>

      {/* Manual Create Incident Modal */}
      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateIncident={handleCreateIncident}
      />

      {/* Incident Triage Detail Drawer */}
      {selectedIncident && (
        <IncidentDetailDrawer
          incident={selectedIncident}
          units={units}
          onClose={() => setSelectedIncident(null)}
          onOpenDispatchModal={(inc) => setDispatchIncident(inc)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Intelligent Dispatch Modal */}
      {dispatchIncident && (
        <DispatchModal
          incident={dispatchIncident}
          units={units}
          onClose={() => setDispatchIncident(null)}
          onDispatchSuccess={handleDispatchSuccess}
        />
      )}

      {/* Alert Center Drawer */}
      {isAlertsOpen && (
        <AlertCenter
          alerts={alerts}
          isOpen={isAlertsOpen}
          onClose={() => setIsAlertsOpen(false)}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          onSelectIncidentById={handleSelectIncidentById}
        />
      )}
    </div>
  );
};

export default App;
