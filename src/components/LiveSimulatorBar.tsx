import React, { useState } from 'react';
import { Play, RefreshCw, AlertOctagon, Flame, Activity, Sparkles, PlusCircle } from 'lucide-react';
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
    setDemoStep('1/5: Generating New Emergency Incident...');
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
    <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex items-center justify-between z-20 shadow-md flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSimulating ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
        </span>
        <span className="text-xs font-mono font-semibold text-slate-300">
          SIMULATOR STATUS: <span className={isSimulating ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
            {isSimulating ? "AUTO SIMULATION ACTIVE" : "STANDBY"}
          </span>
        </span>

        {demoStep && (
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/40 animate-pulse">
            {demoStep}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Guided SIH Demo Scenario Button */}
        <button
          onClick={handleRunFullDemo}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-heading font-extrabold shadow-md transition-all"
          title="Automates step-by-step emergency creation, AI recommendation, dispatch, field update, and SitRep analytics"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>▶ RUN SIH DEMO SCENARIO</span>
        </button>

        {/* Manual Create Incident Button */}
        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-bold transition-all shadow-sm"
            title="Open Manual Incident Entry Form"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Create Incident</span>
          </button>
        )}

        <button
          onClick={() => wsService.triggerSimulatedEvent('NEW_INCIDENT')}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-semibold transition-colors"
        >
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span>+ Incident</span>
        </button>

        <button
          onClick={() => wsService.triggerSimulatedEvent('UNIT_UPDATE')}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-200 text-xs font-semibold transition-colors"
        >
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>En Route</span>
        </button>

        <button
          onClick={() => wsService.triggerSimulatedEvent('ESCALATION')}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-colors"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
          <span>Escalation</span>
        </button>

        <button
          onClick={onToggleSimulator}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold border transition-all ${
            isSimulating
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSimulating ? 'Pause Sim' : 'Auto Sim'}</span>
        </button>
      </div>
    </div>
  );
};
