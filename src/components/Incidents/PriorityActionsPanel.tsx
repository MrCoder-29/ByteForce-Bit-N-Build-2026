import React from 'react';
import { Incident } from '../../types/emergency';
import { ShieldAlert, Clock, ChevronRight, AlertOctagon, Zap } from 'lucide-react';

interface PriorityActionsPanelProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  onOpenDispatchModal: (inc: Incident) => void;
}

export const PriorityActionsPanel: React.FC<PriorityActionsPanelProps> = ({
  incidents,
  onSelectIncident,
  onOpenDispatchModal,
}) => {
  // Surfacing incidents that require immediate operator action (Critical OR SLA <= 3 mins)
  const priorityIncidents = incidents.filter(
    (i) => i.status !== 'RESOLVED' && (i.severity === 'CRITICAL' || i.slaMinutesRemaining <= 3)
  ).slice(0, 3);

  if (priorityIncidents.length === 0) return null;

  return (
    <div className="bg-[#0d1322] border border-red-500/30 rounded-2xl p-3.5 shadow-xl space-y-2 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-950 text-red-400 border border-red-500/40 animate-pulse">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wider">
            PRIORITY OPERATOR ACTIONS REQUIRED
          </span>
        </div>
        <span className="text-[10px] font-mono text-red-400 font-bold bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">
          {priorityIncidents.length} Immediate Action
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
        {priorityIncidents.map((inc) => (
          <div
            key={inc.id}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-red-500/50 flex items-center justify-between gap-2 transition-all"
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                  inc.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-500/30' : 'bg-amber-950 text-amber-400'
                }`}>
                  {inc.severity}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{inc.id}</span>
              </div>
              <div className="font-heading font-bold text-xs text-white truncate">{inc.title}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>SLA: {inc.slaMinutesRemaining}m remaining</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onSelectIncident(inc)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold border border-slate-700"
              >
                VIEW
              </button>
              <button
                onClick={() => onOpenDispatchModal(inc)}
                className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-extrabold shadow-sm"
              >
                DISPATCH
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
