import React from 'react';
import { Incident } from '../../types/emergency';
import { Clock, Zap } from 'lucide-react';

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
    <div className="bg-[#0d1322] border border-red-500/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-950 text-red-400 border border-red-500/50 animate-pulse">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-heading font-extrabold text-base sm:text-lg text-white uppercase tracking-wider">
            PRIORITY OPERATOR ACTIONS REQUIRED
          </span>
        </div>
        <span className="text-sm font-mono text-red-200 font-extrabold bg-red-950/90 px-3.5 py-1 rounded-xl border border-red-500/40 shadow-sm">
          {priorityIncidents.length} Immediate Action
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
        {priorityIncidents.map((inc) => (
          <div
            key={inc.id}
            className="p-4 rounded-xl bg-slate-900/95 border border-slate-800 hover:border-red-500/60 flex items-center justify-between gap-4 transition-all shadow-md"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  inc.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-500/50' : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                }`}>
                  {inc.severity}
                </span>
                <span className="font-mono text-sm font-extrabold text-slate-200">#{inc.id}</span>
              </div>
              <div className="font-heading font-extrabold text-base text-white truncate" title={inc.title}>{inc.title}</div>
              <div className="text-sm text-slate-300 flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>SLA: <strong className="text-amber-300 font-bold">{inc.slaMinutesRemaining}m remaining</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSelectIncident(inc)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs sm:text-sm font-extrabold border border-slate-700 transition-colors"
              >
                VIEW
              </button>
              <button
                onClick={() => onOpenDispatchModal(inc)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-black shadow-md shadow-red-950/40 transition-all hover:scale-105"
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
