import React from 'react';
import { AlertNotice } from '../../types/emergency';
import { X, AlertTriangle, ShieldAlert, Clock, CheckCircle2, ChevronRight, BellRing } from 'lucide-react';

interface AlertCenterProps {
  alerts: AlertNotice[];
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeAlert: (id: string) => void;
  onSelectIncidentById: (id: string) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  isOpen,
  onClose,
  onAcknowledgeAlert,
  onSelectIncidentById,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#0d1322] border-l border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 bg-[#0b0f19] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/40 text-red-400">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-white">Emergency Alert Center</h3>
            <p className="text-[11px] text-slate-400">Real-time Escalation Notices & SLA Breaches</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No active critical alerts at this time. All systems nominal.
          </div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 rounded-xl border transition-all ${
                alt.acknowledged
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : alt.severity === 'CRITICAL'
                  ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-950/20'
                  : 'bg-amber-950/30 border-amber-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${alt.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`} />
                  <span className="font-heading font-bold text-xs text-white">{alt.title}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{new Date(alt.timestamp).toLocaleTimeString()}</span>
              </div>

              <p className="text-xs text-slate-300 leading-normal mb-3">{alt.message}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                {alt.incidentId && (
                  <button
                    onClick={() => {
                      onSelectIncidentById(alt.incidentId!);
                      onClose();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <span>View Incident {alt.incidentId}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}

                {!alt.acknowledged && (
                  <button
                    onClick={() => onAcknowledgeAlert(alt.id)}
                    className="ml-auto px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 border border-slate-700"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Acknowledge</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
