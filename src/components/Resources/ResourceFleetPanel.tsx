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
    <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-heading font-black text-base sm:text-lg text-white flex items-center gap-2.5">
          <Truck className="w-5 h-5 text-emerald-400" />
          <span>Response Fleet Utilization & Readiness</span>
        </h3>
        <span className="text-xs sm:text-sm font-mono font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
          {units.length} Total Units
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const catUnits = units.filter((u) => u.type === cat.type);
          const total = catUnits.length;
          const available = catUnits.filter((u) => u.status === 'AVAILABLE').length;
          const deployed = catUnits.filter((u) => u.status === 'DISPATCHED' || u.status === 'EN_ROUTE' || u.status === 'ON_SCENE').length;
          const pct = total > 0 ? Math.round((deployed / total) * 100) : 0;
          const Icon = cat.icon;

          return (
            <div key={cat.type} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`p-2 rounded-xl border ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="font-heading font-extrabold text-sm sm:text-base text-white">{cat.title}</span>
                </div>
                <span className="text-xs sm:text-sm font-mono font-extrabold text-slate-200 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  {available} Ready / {total}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-semibold pt-0.5">
                <span>Deployed: <strong className="text-amber-400 font-extrabold">{deployed}</strong></span>
                <span>Available: <strong className="text-emerald-400 font-extrabold">{available}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
