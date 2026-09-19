import React, { useState, useEffect } from 'react';
import { Incident, ResourceUnit } from '../types/emergency';
import { GlobalSearch } from './Search/GlobalSearch';
import { Shield, Radio, Bell, BarChart2, Map as MapIcon, Layers, Smartphone, Megaphone, Moon, Sun, ShieldAlert, Users, Clock } from 'lucide-react';

interface HeaderProps {
  activeTab: 'MAP' | 'FEED' | 'ANALYTICS' | 'RESPONDER' | 'CITIZEN';
  setActiveTab: (tab: 'MAP' | 'FEED' | 'ANALYTICS' | 'RESPONDER' | 'CITIZEN') => void;
  incidents: Incident[];
  units: ResourceUnit[];
  activeIncidentsCount: number;
  criticalAlertsCount: number;
  wsConnected: boolean;
  wsSimulating: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleSimulator: () => void;
  onOpenAlerts: () => void;
  onSelectIncident: (inc: Incident) => void;
  onSelectUnit: (unit: ResourceUnit) => void;
  onFilterCritical: () => void;
  onFilterDelayed: () => void;
  onFilterAvailable: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  incidents,
  units,
  activeIncidentsCount,
  criticalAlertsCount,
  wsConnected,
  wsSimulating,
  theme,
  onToggleTheme,
  onToggleSimulator,
  onOpenAlerts,
  onSelectIncident,
  onSelectUnit,
  onFilterCritical,
  onFilterDelayed,
  onFilterAvailable,
}) => {
  const [time, setTime] = useState<string>('');
  const [lastUpdatedSec, setLastUpdatedSec] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setLastUpdatedSec((prev) => (prev >= 60 ? 0 : prev + 1));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#0d1322] border-b border-slate-800/80 px-4 flex items-center justify-between z-30 shrink-0 select-none gap-3">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-950/40 border border-red-500/30">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-lg text-white tracking-wider">
              BYTEFORCE <span className="text-red-500 font-semibold text-xs px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40">HQ</span>
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50 hidden md:inline">PS-9 PLATFORM</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden xl:block">Intelligent Emergency Response & Resource Coordination Platform</p>
        </div>
      </div>

      {/* Global Search Component */}
      <div className="flex-1 max-w-sm hidden md:block">
        <GlobalSearch
          incidents={incidents}
          units={units}
          onSelectIncident={onSelectIncident}
          onSelectUnit={onSelectUnit}
        />
      </div>

      {/* Navigation Tabs covering all 6 Views */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('MAP')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'MAP'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Command HQ Map</span>
        </button>

        <button
          onClick={() => setActiveTab('FEED')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'FEED'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Incident Feed</span>
          {activeIncidentsCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {activeIncidentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'ANALYTICS'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Analytics & SitRep</span>
        </button>

        <button
          onClick={() => setActiveTab('RESPONDER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'RESPONDER'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Responder PWA</span>
        </button>

        <button
          onClick={() => setActiveTab('CITIZEN')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'CITIZEN'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Citizen Portal</span>
        </button>
      </div>

      {/* Right Controls: Connection Status + Theme Switcher + Clock */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Connection Status Indicator */}
        <div className="hidden sm:flex flex-col items-end">
          <button
            onClick={onToggleSimulator}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
              wsConnected
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                : wsSimulating
                ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                : 'bg-red-950/40 text-red-400 border-red-500/30'
            }`}
          >
            <Radio className={`w-3 h-3 ${wsConnected || wsSimulating ? 'animate-pulse' : ''}`} />
            <span>{wsConnected ? 'CONNECTED' : wsSimulating ? 'SIMULATING' : 'OFFLINE'}</span>
          </button>
          <span className="text-[9px] text-slate-400 font-mono mt-0.5">Updated {lastUpdatedSec}s ago</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Alerts Trigger Button */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Open Alert Center"
        >
          <Bell className="w-4 h-4" />
          {criticalAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-bounce shadow-md shadow-red-900">
              {criticalAlertsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
