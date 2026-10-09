import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Sliders,
  CalendarCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import {
  calculateAttendancePercentage,
  calculateClassesNeededForTarget,
  calculateSafeClassesToMiss,
  getAttendanceStatus,
} from '../../utils/academicCalculations';

export const AttendanceCalendarPage: React.FC = () => {
  const {
    subjects,
    attendanceRecords,
    recordAttendance,
    deleteAttendanceRecord,
    student,
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [statusToLog, setStatusToLog] = useState<AttendanceStatus>('present');
  const [notesToLog, setNotesToLog] = useState<string>('');

  const targetAttendance = student?.attendanceTargetPercent || 75;

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar dates generation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group attendance records by date for easy map lookup
  const recordsByDate = attendanceRecords.reduce((acc, rec) => {
    if (!acc[rec.date]) acc[rec.date] = [];
    acc[rec.date].push(rec);
    return acc;
  }, {} as Record<string, typeof attendanceRecords>);

  const handleLogAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedDateStr) return;
    recordAttendance(selectedDateStr, selectedSubjectId, statusToLog, notesToLog.trim() || undefined);
    setNotesToLog('');
  };

  const selectedDateRecords = recordsByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B757B]">Attendance Calendar</h1>
            <span className="text-xs font-semibold text-[#0A858C] bg-[#F0FAF9] border border-[#77DAD7]/50 px-2.5 py-0.5 rounded-full">
              Target: {targetAttendance}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mark daily attendance logs (Present, Absent, Excused) and review mathematical quota calculations.
          </p>
        </div>

        {/* Aggregate Overview */}
        <div className="flex items-center gap-4 bg-[#F0FAF9] p-3 rounded-xl border border-[#A5E6E2]/50 self-start md:self-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Total Logged Entries
            </span>
            <span className="text-xl font-black font-mono text-[#0B757B]">
              {attendanceRecords.length}
            </span>
          </div>
          <div className="w-px h-8 bg-[#A5E6E2]/60" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Subjects Tracked
            </span>
            <span className="text-xl font-black font-mono text-[#0A858C]">
              {subjects.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Calendar on Left, Log Form & Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar View (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">
              {monthNames[month]} {year}
            </h2>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-[#F0FAF9] hover:text-[#0B757B] transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold text-[#0B757B] hover:bg-[#F0FAF9] rounded-lg border border-[#A5E6E2]/60 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-[#F0FAF9] hover:text-[#0B757B] transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 rounded-xl bg-slate-50/40" />
            ))}

            {daysArray.map((dayNum) => {
              const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayRecords = recordsByDate[formattedDateStr] || [];
              const isSelected = selectedDateStr === formattedDateStr;

              const hasPresent = dayRecords.some((r) => r.status === 'present');
              const hasAbsent = dayRecords.some((r) => r.status === 'absent');
              const hasExcused = dayRecords.some((r) => r.status === 'excused');

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(formattedDateStr)}
                  className={`h-14 p-1 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0B757B] bg-[#F0FAF9] ring-2 ring-[#0B757B]/20 shadow-xs'
                      : 'border-slate-100 hover:border-[#77DAD7] hover:bg-[#F0FAF9]/30'
                  }`}
                >
                  <span className={`text-[11px] font-bold px-1 ${isSelected ? 'text-[#0B757B]' : 'text-slate-700'}`}>
                    {dayNum}
                  </span>

                  {/* Status indicator dots */}
                  <div className="flex items-center gap-1 px-1 pb-1">
                    {hasPresent && (
                      <span className="w-2 h-2 rounded-full bg-[#0B757B]" title="Present logged" />
                    )}
                    {hasAbsent && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="Absent logged" />
                    )}
                    {hasExcused && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="Excused logged" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B757B]" />
                Present
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Absent
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Excused
              </span>
            </div>
            <span className="text-slate-400">Click any date to log or view records</span>
          </div>
        </div>

        {/* Log Form & Date Details (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-[#0B757B] uppercase tracking-wider">
                Log Class for {selectedDateStr}
              </h2>
            </div>

            {subjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Please add subjects in "My Subjects" first before logging daily attendance.
              </p>
            ) : (
              <form onSubmit={handleLogAttendance} className="space-y-3.5 text-xs">
                {/* Select Subject */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code ? `${sub.code} — ` : ''}{sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Attendance Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatusToLog('present')}
                      className={`py-2 rounded-xl font-bold transition-all border cursor-pointer ${
                        statusToLog === 'present'
                          ? 'bg-[#0B757B] text-white border-[#0B757B] shadow-xs'
                          : 'bg-[#F0FAF9] text-slate-700 border-[#A5E6E2]/70 hover:bg-[#A5E6E2]/30'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusToLog('absent')}
                      className={`py-2 rounded-xl font-bold transition-all border cursor-pointer ${
                        statusToLog === 'absent'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-[#F0FAF9] text-slate-700 border-[#A5E6E2]/70 hover:bg-rose-50'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusToLog('excused')}
                      className={`py-2 rounded-xl font-bold transition-all border cursor-pointer ${
                        statusToLog === 'excused'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-[#F0FAF9] text-slate-700 border-[#A5E6E2]/70 hover:bg-amber-50'
                      }`}
                    >
                      Excused
                    </button>
                  </div>
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Topic / Notes (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dynamic Programming lecture, Lab verification"
                    value={notesToLog}
                    onChange={(e) => setNotesToLog(e.target.value)}
                    className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Save Attendance Entry
                </button>
              </form>
            )}
          </div>

          {/* Daily Records List for Selected Date */}
          <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Classes Logged on {selectedDateStr}
            </h2>

            {selectedDateRecords.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No attendance logs recorded for this date.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDateRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-[#F0FAF9]/60 border border-[#A5E6E2]/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{rec.subjectName}</p>
                      {rec.notes && <p className="text-[11px] text-slate-500 mt-0.5">{rec.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          rec.status === 'present'
                            ? 'bg-[#A5E6E2]/50 text-[#0B757B]'
                            : rec.status === 'absent'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.status}
                      </span>

                      <button
                        onClick={() => deleteAttendanceRecord(rec.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Standing Table with Quotas */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#0B757B]">
          Subject-Wise Attendance Quota & Calculation Breakdown
        </h2>

        {subjects.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No subjects to calculate. Add subjects to see automatic quotas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 pr-4">Subject</th>
                  <th className="py-2.5 px-3">Classes</th>
                  <th className="py-2.5 px-3">Attendance %</th>
                  <th className="py-2.5 px-3">Target %</th>
                  <th className="py-2.5 px-3">Standing</th>
                  <th className="py-2.5 px-3">Classes Needed</th>
                  <th className="py-2.5 pl-3">Safe to Miss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => {
                  const pct = calculateAttendancePercentage(sub.attendedClasses, sub.totalClasses);
                  const status = getAttendanceStatus(pct, sub.targetAttendance);
                  const needed = calculateClassesNeededForTarget(sub.attendedClasses, sub.totalClasses, sub.targetAttendance);
                  const safe = calculateSafeClassesToMiss(sub.attendedClasses, sub.totalClasses, sub.targetAttendance);

                  return (
                    <tr key={sub.id} className="hover:bg-[#F0FAF9]/50 transition-colors">
                      <td className="py-3 pr-4 font-bold text-slate-800">
                        {sub.code ? `${sub.code} — ` : ''}{sub.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {sub.attendedClasses} / {sub.totalClasses}
                      </td>
                      <td className={`py-3 px-3 font-mono font-bold ${status.colorClass}`}>
                        {pct}%
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {sub.targetAttendance}%
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.badgeBg}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold">
                        {needed > 0 ? (
                          <span className="text-amber-700">+{needed} consecutive</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 pl-3 font-mono font-semibold text-slate-600">
                        {safe > 0 ? safe : 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
