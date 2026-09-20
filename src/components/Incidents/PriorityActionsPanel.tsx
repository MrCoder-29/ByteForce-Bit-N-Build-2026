import React, { useState } from 'react';
import { Incident } from '../../types/emergency';
import { Clock, Zap, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Surfacing incidents that require immediate operator action (Critical OR SLA <= 3 mins)
  const priorityIncidents = incidents.filter(
    (i) => i.status !== 'RESOLVED' && (i.severity === 'CRITICAL' || i.slaMinutesRemaining <= 3)
  ).slice(0, 3);

  if (priorityIncidents.length === 0) return null;

  return (
    <div className="bg-[#0d1322] border border-red-500/40 rounded-xl p-2.5 sm:p-3 shadow-lg select-none shrink-0 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-950 text-red-400 border border-red-500/50 animate-pulse">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-xs sm:text-sm text-white uppercase tracking-wider">
            PRIORITY OPERATOR ACTIONS REQUIRED
          </span>
          <span className="text-xs font-mono text-red-200 font-extrabold bg-red-950/90 px-2 py-0.5 rounded-md border border-red-500/40">
            {priorityIncidents.length} Urgent
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
          title={isCollapsed ? "Expand priority panel" : "Collapse priority panel to enlarge map"}
        >
          <span>{isCollapsed ? 'Show' : 'Collapse'}</span>
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
          {priorityIncidents.map((inc) => (
            <div
              key={inc.id}
              className="p-2.5 rounded-lg bg-slate-900/95 border border-slate-800 hover:border-red-500/60 flex items-center justify-between gap-3 transition-all shadow-sm"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-black px-2 py-0.2 rounded-full border ${
                    inc.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-500/50' : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                  }`}>
                    {inc.severity}
                  </span>
                  <span className="font-mono text-xs font-extrabold text-slate-300">#{inc.id}</span>
                </div>
                <div className="font-heading font-bold text-xs text-white truncate max-w-[180px]" title={inc.title}>{inc.title}</div>
                <div className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>SLA: <strong className="text-amber-300 font-bold">{inc.slaMinutesRemaining}m</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onSelectIncident(inc)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-colors"
                >
                  VIEW
                </button>
                <button
                  onClick={() => onOpenDispatchModal(inc)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-sm transition-all hover:scale-105"
                >
                  DISPATCH
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
