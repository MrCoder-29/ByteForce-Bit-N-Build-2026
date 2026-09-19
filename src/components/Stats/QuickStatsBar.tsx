import React from 'react';
import { Incident, ResourceUnit } from '../../types/emergency';
import { Activity, ShieldAlert, Users, Navigation, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface QuickStatsBarProps {
  incidents: Incident[];
  units: ResourceUnit[];
  onFilterCritical: () => void;
  onFilterDelayed: () => void;
  onFilterAvailable: () => void;
}

export const QuickStatsBar: React.FC<QuickStatsBarProps> = ({
  incidents,
  units,
  onFilterCritical,
  onFilterDelayed,
  onFilterAvailable,
}) => {
  const activeCount = incidents.filter((i) => i.status !== 'RESOLVED').length;
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const availableUnits = units.filter((u) => u.status === 'AVAILABLE').length;
  const dispatchedUnits = units.filter((u) => u.status === 'DISPATCHED' || u.status === 'EN_ROUTE' || u.status === 'ON_SCENE').length;
  const delayedSLA = incidents.filter((i) => i.slaMinutesRemaining <= 3 && i.status !== 'RESOLVED').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-4 py-2 bg-[#0b0f19] border-b border-slate-800 shrink-0 select-none">
      {/* Active Incidents */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Incidents</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-lg text-white">{activeCount}</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
          <Activity className="w-4 h-4" />
        </div>
      </div>

      {/* Critical Incidents */}
      <div
        onClick={onFilterCritical}
        className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/40 flex items-center justify-between shadow-sm cursor-pointer hover:bg-red-950/50 transition-colors"
        title="Click to view critical emergencies"
      >
        <div>
          <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider block">Critical Severity</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-lg text-red-400">{criticalCount}</span>
            <span className="text-[10px] text-red-400 font-bold">Action Req</span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-red-900/60 text-red-400 animate-pulse">
          <ShieldAlert className="w-4 h-4" />
        </div>
      </div>

      {/* Available Fleet */}
      <div
        onClick={onFilterAvailable}
        className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between shadow-sm cursor-pointer hover:bg-emerald-950/50 transition-colors"
        title="Click to view available units"
      >
        <div>
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Available Fleet</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-lg text-emerald-400">{availableUnits}</span>
            <span className="text-[10px] text-slate-400">/ {units.length} Units</span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-emerald-900/60 text-emerald-400">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* Units Dispatched */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Units Deployed</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-lg text-amber-400">{dispatchedUnits}</span>
            <span className="text-[10px] text-amber-400 font-semibold">En Route</span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-amber-900/40 text-amber-400">
          <Navigation className="w-4 h-4" />
        </div>
      </div>

      {/* Delayed SLA Warnings */}
      <div
        onClick={onFilterDelayed}
        className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between shadow-sm cursor-pointer hover:bg-amber-950/50 transition-colors col-span-2 sm:col-span-1"
        title="Click to view incidents nearing SLA breach"
      >
        <div>
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">SLA Warning (&lt;3m)</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-lg text-amber-400">{delayedSLA}</span>
            <span className="text-[10px] text-amber-400 font-bold">Priority</span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-amber-900/60 text-amber-400">
          <Clock className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
