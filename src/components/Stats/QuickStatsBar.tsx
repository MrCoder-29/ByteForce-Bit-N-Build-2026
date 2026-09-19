import React from 'react';
import { Incident, ResourceUnit } from '../../types/emergency';
import { Activity, ShieldAlert, Users, Navigation, TrendingUp, Clock } from 'lucide-react';

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
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-4 py-2.5 bg-[#0b0f19] border-b border-slate-800 shrink-0 select-none">
      {/* Active Incidents */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Active Incidents</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-heading font-extrabold text-2xl text-white">{activeCount}</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Live
            </span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-800 text-cyan-400">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      {/* Critical Incidents */}
      <div
        onClick={onFilterCritical}
        className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center justify-between shadow-sm cursor-pointer hover:bg-red-950/60 transition-colors"
        title="Click to view critical emergencies"
      >
        <div>
          <span className="text-xs font-bold text-red-300 uppercase tracking-wider block">Critical Severity</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-heading font-extrabold text-2xl text-red-400">{criticalCount}</span>
            <span className="text-xs text-red-300 font-bold bg-red-950/80 px-1.5 py-0.5 rounded border border-red-500/30">Action Req</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-red-900/60 text-red-400 animate-pulse">
          <ShieldAlert className="w-5 h-5" />
        </div>
      </div>

      {/* Available Fleet */}
      <div
        onClick={onFilterAvailable}
        className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between shadow-sm cursor-pointer hover:bg-emerald-950/60 transition-colors"
        title="Click to view available units"
      >
        <div>
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">Available Fleet</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-heading font-extrabold text-2xl text-emerald-400">{availableUnits}</span>
            <span className="text-xs text-slate-300 font-semibold">/ {units.length} Units</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-900/60 text-emerald-400">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Units Dispatched */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Units Deployed</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-heading font-extrabold text-2xl text-amber-400">{dispatchedUnits}</span>
            <span className="text-xs text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">En Route</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-900/40 text-amber-400">
          <Navigation className="w-5 h-5" />
        </div>
      </div>

      {/* Delayed SLA Warnings */}
      <div
        onClick={onFilterDelayed}
        className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-center justify-between shadow-sm cursor-pointer hover:bg-amber-950/60 transition-colors col-span-2 sm:col-span-1"
        title="Click to view incidents nearing SLA breach"
      >
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">SLA Warning (&lt;3m)</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-heading font-extrabold text-2xl text-amber-400">{delayedSLA}</span>
            <span className="text-xs text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">Priority</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-900/60 text-amber-400">
          <Clock className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
