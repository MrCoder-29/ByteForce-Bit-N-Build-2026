import React from 'react';
import { AnalyticsData } from '../../types/emergency';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { BarChart2, TrendingUp, Shield, Clock, Users, Activity, Layers, FileText, Sparkles, AlertOctagon, Lightbulb, Printer, CheckCircle2 } from 'lucide-react';

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics }) => {
  const sitRep = analytics.situationReport;

  const handlePrintSitRep = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#090d16] space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Emergency Calls</span>
            <Activity className="w-4 h-4 text-red-500" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-white">{analytics.totalIncidents}</div>
          <div className="text-[11px] text-slate-400">Past 24 Hours Operating Window</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Ongoing Incidents</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-amber-400">{analytics.activeIncidents}</div>
          <div className="text-[11px] text-slate-400">{analytics.resolvedIncidents} Incidents Resolved</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Avg Response Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-cyan-400">{analytics.avgResponseTimeMin} <span className="text-xs font-normal text-slate-400">mins</span></div>
          <div className="text-[11px] text-emerald-400 font-semibold">✓ 14% faster than 5m SLA target</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Response Fleet Ready</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-emerald-400">{analytics.availableUnits} <span className="text-xs font-normal text-slate-400">Units</span></div>
          <div className="text-[11px] text-slate-400">{analytics.dispatchedUnits} Units Currently Deployed</div>
        </div>
      </div>

      {/* AI-Generated Situation Report (SitRep) */}
      {sitRep && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-500/40">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-white">SITUATION REPORT (SITREP)</h3>
                <p className="text-xs text-slate-400">Executive Summary & Operational Threat Analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintSitRep}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                title="Print or export PDF report"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Report</span>
              </button>

              <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                THREAT LEVEL: {sitRep.overallRiskLevel}
              </span>
            </div>
          </div>

          {/* Structured SitRep Sections */}
          <div className="space-y-3">
            {/* Situation Overview */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Situation Overview</span>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {sitRep.executiveSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Critical Developments */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" /> Critical Developments
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {sitRep.criticalBottlenecks.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resource Situation */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Resource Situation
                </span>
                <p className="text-xs text-slate-300">
                  {analytics.availableUnits} response units ready across stations; {analytics.dispatchedUnits} units deployed on scene.
                </p>
              </div>

              {/* Recommended Actions */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" /> Recommended Actions
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {sitRep.aiRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400 text-right pt-1">
              * Generated from current incident data ({new Date().toLocaleTimeString()})
            </div>
          </div>
        </div>
      )}

      {/* Grid Row 1: Donut & Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Types Donut Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-heading font-bold text-sm text-white">Incidents Breakdown by Emergency Type</h3>
            <span className="text-[10px] font-mono text-slate-400">REAL-TIME DATA</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.incidentsByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  label={({ type, count }) => `${type}: ${count}`}
                >
                  {analytics.incidentsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-heading font-bold text-sm text-white">Severity Level Distribution</h3>
            <span className="text-[10px] font-mono text-slate-400">RISK METRICS</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.severityDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="severity" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {analytics.severityDistribution.map((entry, index) => (
                    <Cell key={`sev-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Response Time Trends Line Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-heading font-bold text-sm text-white">Average Dispatch & Arrival Response Time Trends</h3>
            <p className="text-xs text-slate-400">Comparing hourly operational response times against 5-minute target SLA</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.responseTimeTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} unit="m" />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '8px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
              <Line type="monotone" dataKey="avgMin" name="Avg Response Time (Min)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="targetMin" name="SLA Target (Min)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
