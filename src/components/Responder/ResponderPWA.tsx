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
      case 'DISPATCHED':
        return <span className="bg-amber-950/90 text-amber-300 border-2 border-amber-500/60 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold animate-pulse">🟠 DISPATCHED</span>;
      case 'EN_ROUTE':
        return <span className="bg-cyan-950/90 text-cyan-300 border-2 border-cyan-500/60 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold">🔵 EN ROUTE</span>;
      case 'ON_SCENE':
        return <span className="bg-purple-950/90 text-purple-300 border-2 border-purple-500/60 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold">🟣 ON SCENE</span>;
      case 'AVAILABLE':
        return <span className="bg-emerald-950/90 text-emerald-300 border-2 border-emerald-500/60 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold">🟢 COMPLETED / READY</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 border-2 border-slate-700 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold">{status}</span>;
    }
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto p-4 sm:p-8 bg-[#090d16] flex flex-col items-center justify-start min-h-0">
      {/* PWA Mobile & Tablet Frame Container */}
      <div className="w-full max-w-3xl bg-[#0d1322] border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto shrink-0 space-y-0">
        
        {/* Top PWA Status Bar Header */}
        <div className="bg-[#0b0f19] px-5 py-4 border-b-2 border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center font-bold shadow-lg shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base sm:text-xl text-white block">
                BYTEFORCE RESPONDER PWA
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span> FIELD CONNECTED & ENCRYPTED
              </span>
            </div>
          </div>

          {/* Unit Selector Dropdown */}
          <div className="w-full sm:w-auto">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Select Active Field Unit:</label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-xs sm:text-sm font-bold text-white px-3.5 py-2 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.callsign} ({u.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PWA Main Content Body */}
        <div className="p-5 sm:p-7 space-y-6">
          
          {/* Unit Information Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Assigned Response Unit</span>
              <span className="font-heading font-extrabold text-xl sm:text-2xl text-white">{currentUnit?.callsign}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Current Field Status</span>
              {getStatusBadge(currentUnit?.status)}
            </div>
          </div>

          {/* Assigned Incident Detail Card */}
          {assignedIncident ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/60 border-2 border-red-500/50 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-red-950 text-red-300 border border-red-500/40">
                  {assignedIncident.severity} EMERGENCY DISPATCH
                </span>
                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                  {assignedIncident.id}
                </span>
              </div>

              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-xl text-white">{assignedIncident.title}</h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 flex items-start gap-2 font-semibold">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{assignedIncident.location.address}</span>
                </p>
              </div>

              {/* Triage Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <strong className="text-red-400 font-bold block mb-1">🚨 AI Triage Briefing:</strong>
                {assignedIncident.aiSummary}
              </div>

              {/* Casualties Info */}
              {assignedIncident.estimatedCasualties && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs sm:text-sm text-red-200 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Casualty Report: {assignedIncident.estimatedCasualties.summary}</span>
                </div>
              )}

              {/* GPS Navigation Action */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${assignedIncident.location.lat},${assignedIncident.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Navigation className="w-4 h-4" />
                <span>🧭 OPEN GPS TURN-BY-TURN NAVIGATION</span>
              </a>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-base font-extrabold text-white">No Active Dispatches</p>
              <p className="text-xs sm:text-sm text-slate-400">Unit is currently standing by at base station.</p>
            </div>
          )}

          {/* Responder Status Progression Pipeline */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
              Field Status Progression Pipeline (DISPATCHED → EN ROUTE → ON SCENE → COMPLETED)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleStatusAdvance('EN_ROUTE', 'EN_ROUTE')}
                className={`py-3.5 px-4 rounded-2xl border-2 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  currentUnit?.status === 'EN_ROUTE'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-xl shadow-cyan-950 scale-[1.01]'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span>1. En Route to Location</span>
              </button>

              <button
                onClick={() => handleStatusAdvance('ON_SCENE', 'ON_SCENE')}
                className={`py-3.5 px-4 rounded-2xl border-2 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  currentUnit?.status === 'ON_SCENE'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-xl shadow-purple-950 scale-[1.01]'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>2. Arrived On Scene</span>
              </button>

              <button
                onClick={() => handleStatusAdvance('AVAILABLE', 'RESOLVED')}
                className="sm:col-span-2 py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>3. Mark Incident Completed & Return Available</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
