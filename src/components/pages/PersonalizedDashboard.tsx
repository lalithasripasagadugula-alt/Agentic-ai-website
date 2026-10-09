import React, { useState } from 'react';
import {
  CalendarDays,
  BookOpen,
  CheckSquare,
  AlertTriangle,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  User,
  Sliders,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  calculateAttendancePercentage,
  getAttendanceStatus,
} from '../../utils/academicCalculations';

export const PersonalizedDashboard: React.FC = () => {
  const {
    student,
    subjects,
    attendanceRecords,
    todos,
    risks,
    schedule,
    setActiveTab,
  } = useApp();

  // Calculate actual metrics from real student data
  const hasSubjects = subjects.length > 0;
  const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const attendedClasses = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
  const overallAttendancePct = totalClasses > 0 ? calculateAttendancePercentage(attendedClasses, totalClasses) : null;

  const targetAttendance = student?.attendanceTargetPercent || 75;
  const attendanceStatus = overallAttendancePct !== null ? getAttendanceStatus(overallAttendancePct, targetAttendance) : null;

  const pendingTodos = todos.filter((t) => !t.completed);
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysSchedule = schedule.filter((s) => s.date === todayStr);

  const openRisks = risks.filter((r) => r.status === 'Open');
  const highRisksCount = openRisks.filter((r) => r.severity === 'High').length;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#A5E6E2]/60 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#0B757B] bg-[#F0FAF9] border border-[#77DAD7]/50 px-2.5 py-0.5 rounded-full">
                {student?.semester || 'Semester'} · {student?.academicYear || 'Academic Year'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ID: {student?.studentId || 'N/A'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B757B] tracking-tight">
              Welcome back, {student?.fullName || 'Student'}!
            </h1>

            <p className="text-xs text-slate-600 font-medium">
              {student?.branch} · {student?.collegeName}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0B757B] bg-[#F0FAF9] hover:bg-[#A5E6E2]/30 border border-[#77DAD7]/60 rounded-xl transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#0A858C]" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-[#F0FAF9] border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Academic Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Overall Attendance */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-5 rounded-2xl border border-[#A5E6E2]/50 shadow-xs hover:border-[#36B8B7] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Overall Attendance</span>
            <CalendarDays className="w-4 h-4 text-[#0A858C] group-hover:scale-110 transition-transform" />
          </div>

          {overallAttendancePct !== null ? (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-mono ${attendanceStatus?.colorClass}`}>
                  {overallAttendancePct}%
                </span>
                <span className="text-[11px] text-slate-400">Target: {targetAttendance}%</span>
              </div>
              <div className="w-full bg-[#F0FAF9] rounded-full h-2 overflow-hidden border border-[#A5E6E2]/40">
                <div
                  className="bg-[#0B757B] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, overallAttendancePct)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${attendanceStatus?.badgeBg}`}>
                {attendanceStatus?.label} ({attendedClasses}/{totalClasses} classes)
              </span>
            </div>
          ) : (
            <div className="py-2 text-xs text-slate-400">
              <p>Add your data to view this metric</p>
              <span className="text-[11px] text-[#0B757B] font-bold mt-1 inline-block">
                + Add Subject & Classes →
              </span>
            </div>
          )}
        </div>

        {/* Metric 2: Total Subjects */}
        <div
          onClick={() => setActiveTab('subjects')}
          className="bg-white p-5 rounded-2xl border border-[#A5E6E2]/50 shadow-xs hover:border-[#36B8B7] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Enrolled Subjects</span>
            <BookOpen className="w-4 h-4 text-[#0A858C] group-hover:scale-110 transition-transform" />
          </div>

          {hasSubjects ? (
            <div className="space-y-1">
              <span className="text-2xl font-black font-mono text-[#0B757B]">
                {subjects.length}
              </span>
              <p className="text-[11px] text-slate-500">
                {subjects.filter((s) => s.difficulty === 'Hard').length} marked Hard difficulty
              </p>
              <span className="text-[11px] text-[#0A858C] font-semibold block pt-1">
                Manage Coursework →
              </span>
            </div>
          ) : (
            <div className="py-2 text-xs text-slate-400">
              <p>Add your data to view this metric</p>
              <span className="text-[11px] text-[#0B757B] font-bold mt-1 inline-block">
                + Add Subjects →
              </span>
            </div>
          )}
        </div>

        {/* Metric 3: Pending Tasks & Deadlines */}
        <div
          onClick={() => setActiveTab('todos')}
          className="bg-white p-5 rounded-2xl border border-[#A5E6E2]/50 shadow-xs hover:border-[#36B8B7] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Pending Assignments</span>
            <CheckSquare className="w-4 h-4 text-[#0A858C] group-hover:scale-110 transition-transform" />
          </div>

          {todos.length > 0 ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-800">
                  {pendingTodos.length}
                </span>
                <span className="text-[11px] text-slate-400">of {todos.length} total</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {pendingTodos.filter((t) => t.priority === 'Urgent').length} urgent deliverables
              </p>
              <span className="text-[11px] text-[#0A858C] font-semibold block pt-1">
                Open To-Do Planner →
              </span>
            </div>
          ) : (
            <div className="py-2 text-xs text-slate-400">
              <p>Add your data to view this metric</p>
              <span className="text-[11px] text-[#0B757B] font-bold mt-1 inline-block">
                + Add Assignment →
              </span>
            </div>
          )}
        </div>

        {/* Metric 4: Academic Risks */}
        <div
          onClick={() => setActiveTab('risks')}
          className="bg-white p-5 rounded-2xl border border-[#A5E6E2]/50 shadow-xs hover:border-[#36B8B7] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Identified Academic Risks</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>

          {hasSubjects ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-black font-mono ${
                    openRisks.length > 0 ? 'text-amber-700' : 'text-[#0B757B]'
                  }`}
                >
                  {openRisks.length}
                </span>
                <span className="text-[11px] text-slate-400">
                  {openRisks.length > 0 ? `${highRisksCount} High Severity` : 'Standing Safe'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {openRisks.length > 0
                  ? 'Attendance or mark deficits detected'
                  : 'All tracked criteria currently safe'}
              </p>
              <span className="text-[11px] text-[#0A858C] font-semibold block pt-1">
                Review Risk Breakdown →
              </span>
            </div>
          ) : (
            <div className="py-2 text-xs text-slate-400">
              <p>Add your data to view this metric</p>
              <span className="text-[11px] text-[#0B757B] font-bold mt-1 inline-block">
                Enter Subjects to Scan Risks →
              </span>
            </div>
          )}
        </div>

        {/* Metric 5: Today's Scheduled Tasks */}
        <div
          onClick={() => setActiveTab('schedule')}
          className="bg-white p-5 rounded-2xl border border-[#A5E6E2]/50 shadow-xs hover:border-[#36B8B7] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Today's Study Schedule</span>
            <Clock className="w-4 h-4 text-[#0A858C] group-hover:scale-110 transition-transform" />
          </div>

          {schedule.length > 0 ? (
            <div className="space-y-1">
              <span className="text-2xl font-black font-mono text-[#0B757B]">
                {todaysSchedule.length}
              </span>
              <p className="text-[11px] text-slate-500">
                {todaysSchedule.filter((s) => s.completed).length} completed today
              </p>
              <span className="text-[11px] text-[#0A858C] font-semibold block pt-1">
                View Today's Agenda →
              </span>
            </div>
          ) : (
            <div className="py-2 text-xs text-slate-400">
              <p>Add your data to view this metric</p>
              <span className="text-[11px] text-[#0B757B] font-bold mt-1 inline-block">
                Generate Recovery Schedule →
              </span>
            </div>
          )}
        </div>

        {/* Metric 6: Daily Attendance Logs Recorded */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-5 rounded-2xl border border-[#A5E6E2]/50 shadow-xs hover:border-[#36B8B7] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Calendar Logs</span>
            <CalendarCheck className="w-4 h-4 text-[#0A858C] group-hover:scale-110 transition-transform" />
          </div>

          <div className="space-y-1">
            <span className="text-2xl font-black font-mono text-slate-800">
              {attendanceRecords.length}
            </span>
            <p className="text-[11px] text-slate-500">
              Daily lecture entries recorded in interactive calendar
            </p>
            <span className="text-[11px] text-[#0A858C] font-semibold block pt-1">
              Mark Today's Classes →
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Grid */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-xs font-bold text-[#0B757B] uppercase tracking-wider">
            Quick Actions
          </h2>
          <span className="text-[11px] text-slate-400">Direct shortcuts to all functional modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('subjects')}
            className="p-3.5 rounded-xl bg-[#F0FAF9] hover:bg-[#A5E6E2]/30 border border-[#77DAD7]/50 text-left transition-colors group cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#0B757B] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-bold text-slate-800">Add Subject</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Enter course details & marks</p>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className="p-3.5 rounded-xl bg-[#F0FAF9] hover:bg-[#A5E6E2]/30 border border-[#77DAD7]/50 text-left transition-colors group cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-[#0B757B] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-bold text-slate-800">Mark Attendance</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Present / Absent calendar logs</p>
          </button>

          <button
            onClick={() => setActiveTab('todos')}
            className="p-3.5 rounded-xl bg-[#F0FAF9] hover:bg-[#A5E6E2]/30 border border-[#77DAD7]/50 text-left transition-colors group cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-[#0B757B] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-bold text-slate-800">Add Assignment</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Set deadline & priority</p>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className="p-3.5 rounded-xl bg-[#F0FAF9] hover:bg-[#A5E6E2]/30 border border-[#77DAD7]/50 text-left transition-colors group cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-[#0B757B] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-bold text-slate-800">Enter Marks</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Internal test scores</p>
          </button>

          <button
            onClick={() => setActiveTab('risks')}
            className="p-3.5 rounded-xl bg-[#F0FAF9] hover:bg-[#A5E6E2]/30 border border-[#77DAD7]/50 text-left transition-colors group cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-[#0B757B] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-bold text-slate-800">Analyze Risks</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Attendance & score deficits</p>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className="p-3.5 rounded-xl bg-[#F0FAF9] hover:bg-[#A5E6E2]/30 border border-[#77DAD7]/50 text-left transition-colors group cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#0B757B] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-bold text-slate-800">Generate Schedule</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Adaptive 7-day plan</p>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className="p-3.5 rounded-xl bg-[#F0FAF9] hover:bg-[#A5E6E2]/30 border border-[#77DAD7]/50 text-left transition-colors group cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-[#0B757B] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-bold text-slate-800">View Calendar</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Monthly timetable & records</p>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="p-3.5 rounded-xl bg-[#F0FAF9] hover:bg-[#A5E6E2]/30 border border-[#77DAD7]/50 text-left transition-colors group cursor-pointer"
          >
            <User className="w-4 h-4 text-[#0B757B] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-bold text-slate-800">Edit Profile</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Targets & study hours</p>
          </button>
        </div>
      </div>
    </div>
  );
};
