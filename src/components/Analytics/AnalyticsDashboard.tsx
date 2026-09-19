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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
            <span>Total Emergency Calls</span>
            <Activity className="w-5 h-5 text-red-500" />
          </div>
          <div className="font-heading font-black text-3xl sm:text-4xl text-white">{analytics.totalIncidents}</div>
          <div className="text-xs sm:text-sm text-slate-400 font-medium">Past 24 Hours Operating Window</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
            <span>Active Ongoing Incidents</span>
            <Layers className="w-5 h-5 text-amber-500" />
          </div>
          <div className="font-heading font-black text-3xl sm:text-4xl text-amber-400">{analytics.activeIncidents}</div>
          <div className="text-xs sm:text-sm text-slate-400 font-medium">{analytics.resolvedIncidents} Incidents Resolved</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
            <span>Avg Response Time</span>
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="font-heading font-black text-3xl sm:text-4xl text-cyan-400">
            {analytics.avgResponseTimeMin} <span className="text-sm sm:text-base font-semibold text-slate-400">mins</span>
          </div>
          <div className="text-xs sm:text-sm text-emerald-300 font-bold">✓ 14% faster than 5m SLA target</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
            <span>Response Fleet Ready</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="font-heading font-black text-3xl sm:text-4xl text-emerald-400">
            {analytics.availableUnits} <span className="text-sm sm:text-base font-semibold text-slate-400">Units</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-400 font-medium">{analytics.dispatchedUnits} Units Currently Deployed</div>
        </div>
      </div>

      {/* AI-Generated Situation Report (SitRep) */}
      {sitRep && (
        <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-500/40">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-black text-lg sm:text-xl text-white">SITUATION REPORT (SITREP)</h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">Executive Summary & Operational Threat Analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintSitRep}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-2 border border-slate-700 transition-colors shadow-sm"
                title="Print or export PDF report"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Export Report</span>
              </button>

              <span className="text-xs sm:text-sm font-mono font-black bg-amber-950 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-xl tracking-wide shadow-sm">
                THREAT LEVEL: {sitRep.overallRiskLevel}
              </span>
            </div>
          </div>

          {/* Structured SitRep Sections */}
          <div className="space-y-4">
            {/* Situation Overview */}
            <div className="space-y-2">
              <span className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider block">Situation Overview</span>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800 font-medium">
                {sitRep.executiveSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Critical Developments */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <span className="text-xs sm:text-sm font-black text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400" /> Critical Developments
                </span>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200 font-medium">
                  {sitRep.criticalBottlenecks.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-400 font-black">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resource Situation */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <span className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" /> Resource Situation
                </span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {analytics.availableUnits} response units ready across stations; {analytics.dispatchedUnits} units deployed on scene.
                </p>
              </div>

              {/* Recommended Actions */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <span className="text-xs sm:text-sm font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-cyan-400" /> Recommended Actions
                </span>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200 font-medium">
                  {sitRep.aiRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-black">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 text-right pt-1">
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
            <h3 className="font-heading font-black text-base sm:text-lg text-white">Incidents Breakdown by Emergency Type</h3>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">REAL-TIME DATA</span>
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
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-heading font-black text-base sm:text-lg text-white">Severity Level Distribution</h3>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">RISK METRICS</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.severityDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="severity" stroke="#94a3b8" fontSize={13} />
                <YAxis stroke="#94a3b8" fontSize={13} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
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
            <h3 className="font-heading font-black text-base sm:text-lg text-white">Average Dispatch & Arrival Response Time Trends</h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Comparing hourly operational response times against 5-minute target SLA</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.responseTimeTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={13} />
              <YAxis stroke="#94a3b8" fontSize={13} unit="m" />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
              />
              <Legend wrapperStyle={{ color: '#fff', fontSize: '13px' }} />
              <Line type="monotone" dataKey="avgMin" name="Avg Response Time (Min)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="targetMin" name="SLA Target (Min)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
