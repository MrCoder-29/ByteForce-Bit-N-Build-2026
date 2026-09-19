import React from 'react';
import { Incident, ResourceUnit } from '../../types/emergency';
import { X, ShieldAlert, MapPin, Phone, Clock, AlertTriangle, Layers, UserCheck, CheckCircle2, ChevronRight, FileText, Activity, Users, AlertCircle } from 'lucide-react';

interface IncidentDetailDrawerProps {
  incident: Incident | null;
  units: ResourceUnit[];
  onClose: () => void;
  onOpenDispatchModal: (inc: Incident) => void;
  onUpdateStatus: (incidentId: string, status: Incident['status']) => void;
}

export const IncidentDetailDrawer: React.FC<IncidentDetailDrawerProps> = ({
  incident,
  units,
  onClose,
  onOpenDispatchModal,
  onUpdateStatus,
}) => {
  if (!incident) return null;

  const assignedUnit = incident.assignedUnitId
    ? units.find((u) => u.id === incident.assignedUnitId)
    : null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-[#0d1322] border-l border-slate-800 shadow-2xl z-40 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-[#0b0f19] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-red-950/80 border border-red-500/40">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-red-400">{incident.id}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {incident.source.replace('_', ' ')}
              </span>
            </div>
            <h3 className="font-heading font-bold text-sm text-white line-clamp-1">{incident.title}</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Risk Score & SLA Bar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">AI Risk Score</span>
            <div className="flex items-center justify-center gap-1">
              <span className="font-heading font-extrabold text-2xl text-red-500">{incident.riskScore}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">SLA Countdown</span>
            <div className="flex items-center justify-center gap-1.5 font-mono text-lg font-bold text-amber-400">
              <Clock className="w-4 h-4" />
              <span>{incident.slaMinutesRemaining}m 00s</span>
            </div>
          </div>
        </div>

        {/* AI Triage Executive Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/30 border border-red-500/30 space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" />
            <h4 className="font-heading font-bold text-xs text-red-300 uppercase tracking-wider">AI Automated Triage Insight</h4>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{incident.aiSummary}</p>
        </div>

        {/* Estimated Casualties Section */}
        {incident.estimatedCasualties && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-red-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-400" /> Estimated Casualties & Victims
              </span>
              <span className="text-slate-400 font-normal text-[11px]">Field Report</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">INJURED</span>
                <span className="font-heading font-extrabold text-lg text-amber-400">{incident.estimatedCasualties.injured}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">FATALITIES</span>
                <span className="font-heading font-extrabold text-lg text-red-500">{incident.estimatedCasualties.fatalities}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">TRAPPED</span>
                <span className="font-heading font-extrabold text-lg text-cyan-400">{incident.estimatedCasualties.trapped}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 pt-1 leading-normal">{incident.estimatedCasualties.summary}</p>
          </div>
        )}

        {/* Location & Address */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Incident Coordinates & Address</span>
          </div>
          <p className="text-xs text-slate-100 font-semibold">{incident.location.address}</p>
          {incident.location.landmark && (
            <p className="text-[11px] text-slate-400">Landmark: {incident.location.landmark}</p>
          )}
          <div className="text-[11px] font-mono text-slate-500 pt-1">
            LAT: {incident.location.lat.toFixed(4)} | LNG: {incident.location.lng.toFixed(4)} ({incident.location.cityZone})
          </div>
        </div>

        {/* Required Capabilities Badges */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Required Unit Capabilities</label>
          <div className="flex flex-wrap gap-1.5">
            {incident.requiredCapabilities.map((cap, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Assigned Unit Card */}
        {assignedUnit ? (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Assigned Response Unit
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-300">
                {assignedUnit.status}
              </span>
            </div>
            <div className="font-heading font-bold text-sm text-white">{assignedUnit.callsign}</div>
            <p className="text-xs text-slate-300">Personnel: {assignedUnit.personnelCount} Officers | Contact: {assignedUnit.contactChannel}</p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center space-y-2">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
            <p className="text-xs text-amber-200 font-semibold">No Response Unit Dispatched Yet</p>
            <p className="text-[11px] text-slate-400">Immediate action required to meet SLA response window.</p>
          </div>
        )}

        {/* Incident Timeline Section */}
        {incident.timeline && incident.timeline.length > 0 && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Incident Response Timeline
            </label>
            <div className="relative pl-4 border-l-2 border-slate-800 space-y-3">
              {incident.timeline.map((event, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                  <div className="text-[10px] font-mono text-slate-400">{new Date(event.timestamp).toLocaleTimeString()}</div>
                  <div className="font-heading font-bold text-xs text-white">{event.label}</div>
                  <div className="text-[11px] text-slate-300">{event.details}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duplicate Reports Timeline */}
        {incident.duplicates && incident.duplicates.length > 0 && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Grouped Duplicate Call Reports</span>
              <span className="text-cyan-400">{incident.duplicates.length} Calls</span>
            </label>
            <div className="space-y-2">
              {incident.duplicates.map((dup) => (
                <div key={dup.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-cyan-400">{dup.source}</span>
                    <span>{new Date(dup.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="italic">"{dup.rawText}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Button */}
      <div className="p-4 bg-[#0b0f19] border-t border-slate-800 shrink-0">
        <button
          onClick={() => onOpenDispatchModal(incident)}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all"
        >
          <Layers className="w-4 h-4" />
          <span>OPEN RECOMMENDED UNITS DISPATCH</span>
        </button>
      </div>
    </div>
  );
};
