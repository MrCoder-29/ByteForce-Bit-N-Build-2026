import React from 'react';
import { ResourceUnit } from '../../types/emergency';
import { Truck, Flame, HeartPulse, ShieldAlert, Droplets, Radio, ShieldCheck } from 'lucide-react';

interface ResourceFleetPanelProps {
  units: ResourceUnit[];
  onSelectUnit: (unit: ResourceUnit) => void;
}

export const ResourceFleetPanel: React.FC<ResourceFleetPanelProps> = ({ units, onSelectUnit }) => {
  const categories = [
    { type: 'AMBULANCE', title: 'Medical Ambulances', icon: HeartPulse, color: 'text-rose-400 bg-rose-950/40 border-rose-500/30' },
    { type: 'FIRE_ENGINE', title: 'Fire Engines', icon: Flame, color: 'text-red-400 bg-red-950/40 border-red-500/30' },
    { type: 'HAZMAT_UNIT', title: 'Hazmat Units', icon: ShieldAlert, color: 'text-purple-400 bg-purple-950/40 border-purple-500/30' },
    { type: 'POLICE_PATROL', title: 'Police Patrols', icon: ShieldCheck, color: 'text-yellow-400 bg-yellow-950/40 border-yellow-500/30' },
    { type: 'RESCUE_BOAT', title: 'Rescue Boats', icon: Droplets, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' },
    { type: 'DRONE', title: 'Recon Drones', icon: Radio, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
  ];

  return (
    <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-400" />
          <span>Response Fleet Utilization & Readiness</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-400">{units.length} Total Units</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const catUnits = units.filter((u) => u.type === cat.type);
          const total = catUnits.length;
          const available = catUnits.filter((u) => u.status === 'AVAILABLE').length;
          const deployed = catUnits.filter((u) => u.status === 'DISPATCHED' || u.status === 'EN_ROUTE' || u.status === 'ON_SCENE').length;
          const pct = total > 0 ? Math.round((deployed / total) * 100) : 0;
          const Icon = cat.icon;

          return (
            <div key={cat.type} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg border ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-heading font-semibold text-xs text-white">{cat.title}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {available} Ready / {total}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-0.5">
                <span>Deployed: <strong className="text-amber-400">{deployed}</strong></span>
                <span>Available: <strong className="text-emerald-400">{available}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
