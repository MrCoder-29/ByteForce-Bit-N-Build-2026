import React, { useState } from 'react';
import { Incident, EmergencyType, SeverityLevel } from '../../types/emergency';
import { Search, Filter, AlertTriangle, ShieldAlert, Clock, Copy, ChevronRight, Flame, HeartPulse, Droplets, Car, ChevronDown, ChevronUp, RefreshCw, PlusCircle } from 'lucide-react';

interface IncidentFeedProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
  onOpenDispatchModal: (inc: Incident) => void;
  onOpenCreateModal?: () => void;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onOpenDispatchModal,
  onOpenCreateModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'SEVERITY' | 'STATUS'>('NEWEST');
  const [expandedTriageIds, setExpandedTriageIds] = useState<Set<string>>(new Set());

  const toggleTriageExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTriageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered logic
  let filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.location.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || inc.type === selectedType;
    const matchesSeverity = selectedSeverity === 'ALL' || inc.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'ALL' || inc.status === selectedStatus;

    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  // Sorting logic
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'NEWEST') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (sortBy === 'OLDEST') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    if (sortBy === 'SEVERITY') {
      const order: Record<SeverityLevel, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return order[b.severity] - order[a.severity];
    }
    if (sortBy === 'STATUS') return a.status.localeCompare(b.status);
    return 0;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setSelectedSeverity('ALL');
    setSelectedStatus('ALL');
    setSortBy('NEWEST');
  };

  const getEmergencyIcon = (type: EmergencyType) => {
    switch (type) {
      case 'FIRE': return <Flame className="w-4 h-4 text-red-500" />;
      case 'MEDICAL': return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'FLOOD': return <Droplets className="w-4 h-4 text-cyan-500" />;
      case 'ACCIDENT': return <Car className="w-4 h-4 text-amber-500" />;
      case 'HAZMAT': return <ShieldAlert className="w-4 h-4 text-purple-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL': return <span className="bg-red-950/90 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full text-[10px] font-extrabold animate-pulse">🔴 CRITICAL</span>;
      case 'HIGH': return <span className="bg-orange-950/90 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded-full text-[10px] font-extrabold">🟠 HIGH</span>;
      case 'MEDIUM': return <span className="bg-yellow-950/90 text-yellow-400 border border-yellow-500/40 px-2 py-0.5 rounded-full text-[10px] font-extrabold">🟡 MEDIUM</span>;
      case 'LOW': return <span className="bg-blue-950/90 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full text-[10px] font-extrabold">🔵 LOW</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
      {/* Feed Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0b0f19]/80 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-base text-white">Live Incident Feed</h3>
            <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              {filtered.length} Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCreateModal && (
              <button
                onClick={onOpenCreateModal}
                className="text-[11px] font-bold text-emerald-300 bg-emerald-950/90 hover:bg-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1.5 transition-all"
                title="Create a new manual test incident"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Create Incident</span>
              </button>
            )}
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800"
              title="Clear active filters"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, title, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/60 transition-colors"
          />
        </div>

        {/* Filters & Sorting Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-red-500 text-[11px]"
          >
            <option value="ALL">All Types</option>
            <option value="FIRE">Fire</option>
            <option value="MEDICAL">Medical</option>
            <option value="FLOOD">Flood</option>
            <option value="ACCIDENT">Accident</option>
            <option value="HAZMAT">Hazmat</option>
            <option value="CRIME">Crime</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-red-500 text-[11px]"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-red-500 text-[11px]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="TRIAGED">Triaged</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="ON_SCENE">On Scene</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-red-500 text-[11px]"
          >
            <option value="NEWEST">Sort: Newest</option>
            <option value="OLDEST">Sort: Oldest</option>
            <option value="SEVERITY">Sort: Severity</option>
            <option value="STATUS">Sort: Status</option>
          </select>
        </div>
      </div>

      {/* Incident Feed List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">No active incidents match your filter criteria.</p>
            <button onClick={handleClearFilters} className="text-xs font-bold text-cyan-400 hover:underline">
              Reset Filters
            </button>
          </div>
        ) : (
          filtered.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            const isExpanded = expandedTriageIds.has(inc.id);

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none relative ${
                  isSelected
                    ? 'bg-slate-800/90 border-red-500/70 shadow-lg shadow-red-950/30 ring-1 ring-red-500/50'
                    : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                {/* Top Header Row */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/60">
                      {getEmergencyIcon(inc.type)}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-300">{inc.id}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {inc.duplicateCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-cyan-500/30 flex items-center gap-1" title="Duplicate reports grouped by AI">
                        <Copy className="w-3 h-3" />
                        {inc.duplicateCount} dups
                      </span>
                    )}

                    {getSeverityBadge(inc.severity)}
                  </div>
                </div>

                {/* Title & Location */}
                <h4 className="font-heading font-bold text-xs text-white mb-1 line-clamp-1">{inc.title}</h4>
                <p className="text-[11px] text-slate-400 mb-2 line-clamp-1">📍 {inc.location.address}</p>

                {/* Collapsible AI Triage Section */}
                {isExpanded && (
                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 mb-2 text-[11px] text-slate-300 animate-in fade-in duration-150">
                    <span className="text-red-400 font-bold block mb-0.5">AI Triage Executive Note:</span>
                    {inc.aiSummary}
                  </div>
                )}

                {/* Footer Metadata & Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <span className="font-semibold text-slate-300">
                      Status: <span className="text-amber-400 font-bold">{inc.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Collapsible Toggle */}
                    <button
                      type="button"
                      onClick={(e) => toggleTriageExpand(inc.id, e)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 flex items-center gap-0.5"
                    >
                      <span>AI Triage</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDispatchModal(inc);
                      }}
                      className="px-2.5 py-1 rounded-md bg-red-600/90 hover:bg-red-600 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <span>Dispatch</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
