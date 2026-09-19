import React, { useState, useRef, useEffect } from 'react';
import { Incident, ResourceUnit } from '../../types/emergency';
import { Search, Flame, HeartPulse, Droplets, Car, ShieldAlert, AlertTriangle, Truck, X, ChevronRight } from 'lucide-react';

interface GlobalSearchProps {
  incidents: Incident[];
  units: ResourceUnit[];
  onSelectIncident: (incident: Incident) => void;
  onSelectUnit: (unit: ResourceUnit) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  incidents,
  units,
  onSelectIncident,
  onSelectUnit,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchingIncidents = query.trim()
    ? incidents.filter(
        (inc) =>
          inc.id.toLowerCase().includes(query.toLowerCase()) ||
          inc.title.toLowerCase().includes(query.toLowerCase()) ||
          inc.location.address.toLowerCase().includes(query.toLowerCase()) ||
          inc.type.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchingUnits = query.trim()
    ? units.filter(
        (u) =>
          u.id.toLowerCase().includes(query.toLowerCase()) ||
          u.callsign.toLowerCase().includes(query.toLowerCase()) ||
          u.type.toLowerCase().includes(query.toLowerCase()) ||
          u.location.address.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const hasResults = matchingIncidents.length > 0 || matchingUnits.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Global Search (Incident ID, type, location, unit callsign)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner font-medium"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1322] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
          {!hasResults ? (
            <div className="p-4 text-center text-sm text-slate-400">
              No matching incidents or response units found for "<strong className="text-white">{query}</strong>"
            </div>
          ) : (
            <>
              {/* Incidents Group */}
              {matchingIncidents.length > 0 && (
                <div className="p-2.5 space-y-1">
                  <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Incidents ({matchingIncidents.length})
                  </div>
                  {matchingIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => {
                        onSelectIncident(inc);
                        setIsOpen(false);
                      }}
                      className="p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-sm transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-red-400 text-sm">{inc.id}</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                            inc.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-500/40' : 'bg-orange-950 text-orange-400 border-orange-500/40'
                          }`}>
                            {inc.severity}
                          </span>
                        </div>
                        <div className="font-bold text-white text-sm line-clamp-1">{inc.title}</div>
                        <div className="text-xs text-slate-300 font-medium line-clamp-1">📍 {inc.location.address}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Units Group */}
              {matchingUnits.length > 0 && (
                <div className="p-2.5 space-y-1">
                  <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Response Units ({matchingUnits.length})
                  </div>
                  {matchingUnits.map((unit) => (
                    <div
                      key={unit.id}
                      onClick={() => {
                        onSelectUnit(unit);
                        setIsOpen(false);
                      }}
                      className="p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-sm transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400 text-sm">{unit.callsign}</span>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                            {unit.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium mt-0.5">{unit.type.replace('_', ' ')} • {unit.location.address}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
