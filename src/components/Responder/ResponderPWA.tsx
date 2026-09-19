import React, { useState } from 'react';
import { Incident, ResourceUnit } from '../../types/emergency';
import { Smartphone, Navigation, ShieldCheck, MapPin, Phone, Radio, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Clock, UserCheck } from 'lucide-react';

interface ResponderPWAProps {
  units: ResourceUnit[];
  incidents: Incident[];
  onUpdateUnitStatus: (unitId: string, status: ResourceUnit['status']) => void;
  onUpdateIncidentStatus: (incidentId: string, status: Incident['status']) => void;
}

export const ResponderPWA: React.FC<ResponderPWAProps> = ({
  units,
  incidents,
  onUpdateUnitStatus,
  onUpdateIncidentStatus,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[4]?.id || units[0]?.id || 'UNIT-FIRE-02');

  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const assignedIncident = incidents.find((i) => i.id === currentUnit?.currentIncidentId) || incidents[2];

  const handleStatusAdvance = (nextStatus: ResourceUnit['status'], nextIncStatus: Incident['status']) => {
    if (!currentUnit) return;
    onUpdateUnitStatus(currentUnit.id, nextStatus);
    if (assignedIncident) {
      onUpdateIncidentStatus(assignedIncident.id, nextIncStatus);
    }
  };

  const getStatusBadge = (status?: ResourceUnit['status']) => {
    switch (status) {
      case 'DISPATCHED': return <span className="bg-amber-950 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-extrabold">🟠 DISPATCHED</span>;
      case 'EN_ROUTE': return <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-extrabold">🔵 EN ROUTE</span>;
      case 'ON_SCENE': return <span className="bg-purple-950 text-purple-400 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-extrabold">🟣 ON SCENE</span>;
      case 'AVAILABLE': return <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-extrabold">🟢 COMPLETED / READY</span>;
      default: return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-extrabold">{status}</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#090d16] flex flex-col items-center justify-center">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[640px] relative">
        {/* Top PWA Status Bar */}
        <div className="bg-[#0b0f19] px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs text-white block">BYTEFORCE RESPONDER PWA</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> FIELD CONNECTED
              </span>
            </div>
          </div>

          {/* Unit Selector Dropdown */}
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.callsign} ({u.status})
              </option>
            ))}
          </select>
        </div>

        {/* PWA Body Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Unit Information Badge */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Unit Callsign</span>
              <span className="font-heading font-extrabold text-sm text-white">{currentUnit?.callsign}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Current Field Status</span>
              {getStatusBadge(currentUnit?.status)}
            </div>
          </div>

          {/* Assigned Incident Alert Box */}
          {assignedIncident ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 border border-red-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30">
                  {assignedIncident.severity} EMERGENCY
                </span>
                <span className="text-[10px] font-mono text-slate-400">{assignedIncident.id}</span>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-white">{assignedIncident.title}</h4>
                <p className="text-xs text-slate-300 mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{assignedIncident.location.address}</span>
                </p>
              </div>

              {/* Triage Summary */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                <strong className="text-red-400">AI Triage Note:</strong> {assignedIncident.aiSummary}
              </div>

              {/* Casualties summary */}
              {assignedIncident.estimatedCasualties && (
                <div className="p-2 rounded-lg bg-red-950/30 border border-red-500/20 text-[11px] text-red-300">
                  <strong>Casualties:</strong> {assignedIncident.estimatedCasualties.summary}
                </div>
              )}

              {/* Route & Navigation Action */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${assignedIncident.location.lat},${assignedIncident.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>OPEN GPS NAVIGATION</span>
              </a>
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-white">No Active Dispatches</p>
              <p className="text-[11px] text-slate-400">Unit is currently standing by at base station.</p>
            </div>
          )}

          {/* Interactive Responder Status Update Pipeline */}
          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Field Status Progression (DISPATCHED → EN ROUTE → ON SCENE → COMPLETED)
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusAdvance('EN_ROUTE', 'EN_ROUTE')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentUnit?.status === 'EN_ROUTE'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-950'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>1. En Route</span>
              </button>

              <button
                onClick={() => handleStatusAdvance('ON_SCENE', 'ON_SCENE')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentUnit?.status === 'ON_SCENE'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>2. On Scene</span>
              </button>

              <button
                onClick={() => handleStatusAdvance('AVAILABLE', 'RESOLVED')}
                className="col-span-2 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>3. Mark Incident Completed & Return Available</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
