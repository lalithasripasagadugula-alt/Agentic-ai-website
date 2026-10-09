import React from 'react';
import {
  BarChart3,
  TrendingUp,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateAttendancePercentage } from '../../utils/academicCalculations';

export const ProgressAnalyticsPage: React.FC = () => {
  const { subjects, todos, risks, schedule, student } = useApp();

  const hasSubjects = subjects.length > 0;
  const targetAttendance = student?.attendanceTargetPercent || 75;

  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalScheduleTasks = schedule.length;
  const completedScheduleTasks = schedule.filter((s) => s.completed).length;
  const scheduleCompletionRate =
    totalScheduleTasks > 0 ? Math.round((completedScheduleTasks / totalScheduleTasks) * 100) : 0;

  const openRisksCount = risks.filter((r) => r.status === 'Open').length;
  const resolvedRisksCount = risks.filter((r) => r.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B757B]">Progress & Academic Analytics</h1>
            <span className="text-xs font-semibold text-[#0A858C] bg-[#F0FAF9] border border-[#77DAD7]/50 px-2.5 py-0.5 rounded-full">
              Calculated From Saved Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real performance distributions, continuous internal scores, and risk remediation progress.
          </p>
        </div>
      </div>

      {!hasSubjects && totalTasks === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-[#A5E6E2]/50 text-center space-y-2">
          <BarChart3 className="w-10 h-10 text-[#77DAD7] mx-auto" />
          <h2 className="text-sm font-bold text-slate-800">Insufficient Data for Analytics</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your subjects, internal marks, and study tasks. Analytics and trend metrics are generated
            purely from your saved data without fabricated charts.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 4 Metric Summaries */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#A5E6E2]/50 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">Task Completion Rate</span>
              <span className="text-2xl font-black font-mono text-[#0B757B]">
                {taskCompletionRate}%
              </span>
              <p className="text-[11px] text-slate-400">
                {completedTasks} of {totalTasks} tasks marked complete
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#A5E6E2]/50 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">Schedule Velocity</span>
              <span className="text-2xl font-black font-mono text-[#0A858C]">
                {scheduleCompletionRate}%
              </span>
              <p className="text-[11px] text-slate-400">
                {completedScheduleTasks} of {totalScheduleTasks} study sessions completed
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#A5E6E2]/50 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">Resolved Risks</span>
              <span className="text-2xl font-black font-mono text-teal-600">
                {resolvedRisksCount}
              </span>
              <p className="text-[11px] text-slate-400">
                {openRisksCount} open academic risk(s) remaining
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#A5E6E2]/50 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">Tracked Courses</span>
              <span className="text-2xl font-black font-mono text-[#0B757B]">
                {subjects.length}
              </span>
              <p className="text-[11px] text-slate-400">
                Institutional target: {targetAttendance}%
              </p>
            </div>
          </div>

          {/* Subject Attendance Breakdown Chart (Visual Bar Distribution) */}
          <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#0B757B]">
              Subject Attendance Distribution vs Target Threshold ({targetAttendance}%)
            </h2>

            <div className="space-y-4">
              {subjects.map((sub) => {
                const pct = calculateAttendancePercentage(sub.attendedClasses, sub.totalClasses);
                const isUnder = pct < targetAttendance;

                return (
                  <div key={sub.id} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate max-w-xs">
                        {sub.code ? `${sub.code} — ` : ''}{sub.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">
                          {sub.attendedClasses}/{sub.totalClasses} classes
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            isUnder ? 'text-rose-600' : 'text-[#0B757B]'
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-[#F0FAF9] rounded-full h-3 overflow-hidden border border-[#A5E6E2]/40 relative">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isUnder ? 'bg-rose-500' : 'bg-[#0B757B]'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Internal Assessment Marks Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#0B757B]">
              Continuous Internal Assessment Performance
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjects.map((sub) => {
                const hasMarks =
                  sub.internalMarksObtained !== undefined &&
                  sub.maxInternalMarks !== undefined &&
                  sub.maxInternalMarks > 0;

                const scorePct = hasMarks
                  ? Math.round((sub.internalMarksObtained! / sub.maxInternalMarks!) * 100)
                  : null;

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl bg-[#F0FAF9]/60 border border-[#A5E6E2]/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="truncate">{sub.name}</span>
                      <span className="font-mono text-[#0B757B]">
                        {hasMarks ? `${sub.internalMarksObtained}/${sub.maxInternalMarks}` : 'Not entered'}
                      </span>
                    </div>

                    {hasMarks ? (
                      <div>
                        <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              scorePct! < 50 ? 'bg-rose-500' : 'bg-[#36B8B7]'
                            }`}
                            style={{ width: `${Math.min(100, scorePct!)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                          Score: {scorePct}% of maximum continuous evaluation marks
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        No internal marks entered for this subject yet.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
