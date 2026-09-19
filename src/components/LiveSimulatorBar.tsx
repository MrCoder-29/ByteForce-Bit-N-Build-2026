import React, { useState } from 'react';
import { Play, RefreshCw, AlertOctagon, Flame, Activity, Sparkles, PlusCircle } from 'lucide-react';
import { emergencyApi } from '../services/api';
import { wsService } from '../services/websocket';

interface LiveSimulatorBarProps {
  isSimulating: boolean;
  onToggleSimulator: () => void;
  onRunDemoScenario?: () => void;
  onOpenCreateModal?: () => void;
}

export const LiveSimulatorBar: React.FC<LiveSimulatorBarProps> = ({
  isSimulating,
  onToggleSimulator,
  onRunDemoScenario,
  onOpenCreateModal,
}) => {
  const [demoStep, setDemoStep] = useState<string | null>(null);

  const handleRunFullDemo = () => {
    setDemoStep('1/5: Triggering Scenario A via AI Backend...');
    emergencyApi.triggerScenario('A').catch(() => null);
    wsService.triggerSimulatedEvent('NEW_INCIDENT');

    setTimeout(() => {
      setDemoStep('2/5: Calculating AI Unit Recommendation...');
    }, 2000);

    setTimeout(() => {
      setDemoStep('3/5: Simulating Unit Dispatch & Route Drawing...');
      wsService.triggerSimulatedEvent('UNIT_UPDATE');
    }, 4500);

    setTimeout(() => {
      setDemoStep('4/5: Triggering SLA Escalation Warning...');
      wsService.triggerSimulatedEvent('ESCALATION');
    }, 7000);

    setTimeout(() => {
      setDemoStep('✓ SIH Demo Scenario Complete!');
      if (onRunDemoScenario) onRunDemoScenario();
      setTimeout(() => setDemoStep(null), 4000);
    }, 9500);
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-20 shadow-md flex-wrap gap-2.5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-2.5 w-2.5 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSimulating ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimulating ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
        </span>
        <span className="text-sm font-mono font-semibold text-slate-200">
          SIMULATOR STATUS: <span className={isSimulating ? "text-amber-400 font-extrabold" : "text-emerald-400 font-extrabold"}>
            {isSimulating ? "AUTO SIMULATION ACTIVE" : "STANDBY"}
          </span>
        </span>

        {demoStep && (
          <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300 bg-cyan-950/90 px-3 py-1 rounded-lg border border-cyan-500/50 animate-pulse">
            {demoStep}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Guided SIH Demo Scenario Button */}
        <button
          onClick={handleRunFullDemo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-sm font-heading font-black shadow-lg transition-all hover:scale-105"
          title="Automates step-by-step emergency creation, AI recommendation, dispatch, field update, and SitRep analytics"
        >
          <Sparkles className="w-4 h-4" />
          <span>▶ RUN SIH DEMO SCENARIO</span>
        </button>

        {/* Manual Create Incident Button */}
        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-sm font-extrabold transition-all shadow-sm"
            title="Open Manual Incident Entry Form"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>+ Create Incident</span>
          </button>
        )}

        <button
          onClick={() => wsService.triggerSimulatedEvent('NEW_INCIDENT')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500/50 text-red-200 text-sm font-extrabold transition-colors"
        >
          <Flame className="w-4 h-4 text-red-400" />
          <span>+ Incident</span>
        </button>

        <button
          onClick={() => wsService.triggerSimulatedEvent('UNIT_UPDATE')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 border border-blue-500/50 text-blue-200 text-sm font-extrabold transition-colors"
        >
          <Activity className="w-4 h-4 text-blue-400" />
          <span>En Route</span>
        </button>

        <button
          onClick={() => wsService.triggerSimulatedEvent('ESCALATION')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-amber-200 text-sm font-extrabold transition-colors"
        >
          <AlertOctagon className="w-4 h-4 text-amber-400" />
          <span>Escalation</span>
        </button>

        <button
          onClick={onToggleSimulator}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-extrabold border transition-all ${
            isSimulating
              ? 'bg-amber-500/30 text-amber-200 border-amber-500/60'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isSimulating ? 'Pause Sim' : 'Auto Sim'}</span>
        </button>
      </div>
    </div>
  );
};
