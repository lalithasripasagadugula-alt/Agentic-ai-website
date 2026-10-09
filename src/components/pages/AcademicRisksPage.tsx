import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AcademicRisk } from '../../types';

export const AcademicRisksPage: React.FC = () => {
  const { risks, updateRiskStatus, subjects, todos, setActiveTab } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'In Progress' | 'Resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const openCount = risks.filter((r) => r.status === 'Open').length;
  const inProgressCount = risks.filter((r) => r.status === 'In Progress').length;
  const resolvedCount = risks.filter((r) => r.status === 'Resolved').length;

  const filteredRisks = risks.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B757B]">Academic Risk Analysis Engine</h1>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {openCount} Open Risk{openCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rule-based algorithmic scanning evaluating attendance thresholds, continuous marks, and task deadlines.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('schedule')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start md:self-center shrink-0 cursor-pointer"
        >
          <Clock className="w-4 h-4" />
          <span>Convert Risks to Recovery Schedule</span>
        </button>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Open Risks
          </span>
          <span className="text-2xl font-black font-mono text-rose-600 mt-1 block">
            {openCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            In Progress
          </span>
          <span className="text-2xl font-black font-mono text-amber-600 mt-1 block">
            {inProgressCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Resolved
          </span>
          <span className="text-2xl font-black font-mono text-[#0B757B] mt-1 block">
            {resolvedCount}
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#A5E6E2]/50 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: `All Risks (${risks.length})` },
            { id: 'Open', label: `Open (${openCount})` },
            { id: 'In Progress', label: `In Progress (${inProgressCount})` },
            { id: 'Resolved', label: `Resolved (${resolvedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#0B757B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0B757B] hover:bg-[#F0FAF9]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="p-2 bg-white border border-[#A5E6E2]/70 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Risks List */}
      {filteredRisks.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-[#A5E6E2]/50 text-center space-y-2">
          <ShieldCheck className="w-10 h-10 text-[#36B8B7] mx-auto" />
          <h2 className="text-sm font-bold text-slate-800">
            {subjects.length === 0
              ? 'No Course Data Available for Analysis'
              : 'No Academic Risks Detected Under this Filter'}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {subjects.length === 0
              ? 'Add your subjects and daily attendance records. ProAct AI scans your real numbers for deficits.'
              : 'All evaluated attendance and assessment records currently meet or exceed configured academic requirements.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRisks.map((risk) => {
            const isHigh = risk.severity === 'High';
            const isResolved = risk.status === 'Resolved';

            return (
              <div
                key={risk.id}
                className={`bg-white rounded-2xl p-6 border transition-all shadow-xs space-y-4 ${
                  isResolved
                    ? 'border-slate-200 opacity-60 bg-slate-50/40'
                    : isHigh
                    ? 'border-rose-300 ring-1 ring-rose-100'
                    : 'border-amber-300 ring-1 ring-amber-50'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isResolved
                          ? 'bg-slate-100 text-slate-500'
                          : isHigh
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {risk.subjectName}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {risk.category}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-slate-900 mt-0.5">{risk.title}</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        risk.severity === 'High'
                          ? 'bg-rose-600 text-white'
                          : risk.severity === 'Medium'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-500 text-white'
                      }`}
                    >
                      {risk.severity} Severity
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        risk.status === 'Resolved'
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : risk.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {risk.status}
                    </span>
                  </div>
                </div>

                {/* Body: Trigger Data & Why it Matters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#F0FAF9]/60 border border-[#A5E6E2]/40 space-y-1">
                    <span className="text-[10px] font-bold text-[#0B757B] uppercase tracking-wider block">
                      Triggering Student Data / Rule
                    </span>
                    <p className="text-slate-700 leading-relaxed">{risk.triggerData}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Why this Risk Matters
                    </span>
                    <p className="text-slate-700 leading-relaxed">{risk.whyItMatters}</p>
                  </div>
                </div>

                {/* Actionable recommendation */}
                <div className="p-3.5 rounded-xl bg-[#F0FAF9] border border-[#77DAD7]/70 text-xs text-[#0B757B] space-y-1">
                  <span className="font-bold block">Recommended Corrective Action:</span>
                  <p className="text-slate-700 leading-relaxed">{risk.recommendedAction}</p>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Suggested Target Date: {risk.suggestedDate}</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {risk.status !== 'Resolved' && (
                      <button
                        onClick={() => updateRiskStatus(risk.id, 'In Progress')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                      >
                        Mark In Progress
                      </button>
                    )}

                    {risk.status !== 'Resolved' ? (
                      <button
                        onClick={() => updateRiskStatus(risk.id, 'Resolved')}
                        className="px-3.5 py-1.5 rounded-lg bg-[#0B757B] hover:bg-[#0A858C] text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Resolved</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => updateRiskStatus(risk.id, 'Open')}
                        className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium"
                      >
                        Reopen Risk
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
