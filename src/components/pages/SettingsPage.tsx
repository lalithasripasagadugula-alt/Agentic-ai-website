import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Shield,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsPage: React.FC = () => {
  const {
    student,
    saveProfile,
    resetAllData,
  } = useApp();

  const [target, setTarget] = useState(student?.attendanceTargetPercent || 75);
  const [studyHours, setStudyHours] = useState(student?.dailyStudyHours || 3);
  const [saveNotice, setSaveNotice] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    saveProfile({
      ...student,
      attendanceTargetPercent: Number(target),
      dailyStudyHours: Number(studyHours),
    });

    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = localStorage.getItem('proact_student_agent_v2');
    if (!dataStr) return;
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proact-student-records-${student?.studentId || 'backup'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs">
        <h1 className="text-xl font-bold text-[#0B757B]">Settings & Target Preferences</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure institutional evaluation thresholds, study limits, and data storage privacy.
        </p>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-xl bg-[#F0FAF9] border border-[#36B8B7] text-[#0B757B] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0A858C]" />
          <span className="font-semibold">Target preferences saved and recalculated successfully!</span>
        </div>
      )}

      {/* Target Config Form */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-5 text-xs"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <SlidersHorizontal className="w-4 h-4 text-[#0B757B]" />
          <h2 className="text-sm font-bold text-slate-800">Academic Thresholds</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Minimum Attendance Target Percentage
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="50"
                max="100"
                required
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl font-mono focus:outline-hidden"
              />
              <span className="font-mono font-bold text-[#0B757B]">%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used across all subjects by the Attendance Calendar and Risk Engine.
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Daily Available Study Budget (Hours/Day)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="12"
                step="0.5"
                required
                value={studyHours}
                onChange={(e) => setStudyHours(Number(e.target.value))}
                className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl font-mono focus:outline-hidden"
              />
              <span className="text-slate-500">hours</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              The Recovery Scheduler caps daily scheduled blocks to this amount.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
          >
            Update Target Preferences
          </button>
        </div>
      </form>

      {/* Data Storage & Privacy Notice */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <HardDrive className="w-4 h-4 text-[#0B757B]" />
          <h2 className="text-sm font-bold text-slate-800">Data Storage & Persistence Disclosure</h2>
        </div>

        <div className="p-4 rounded-xl bg-[#F0FAF9]/60 border border-[#A5E6E2]/40 space-y-2 text-slate-600 leading-relaxed">
          <p>
            <strong>Storage Location:</strong> All student profile records, subjects, daily attendance calendar logs,
            to-do tasks, and generated schedules are stored locally in your browser's persistent storage.
          </p>
          <p>
            <strong>Privacy Guarantee:</strong> No student records are transmitted to or stored on third-party tracking databases.
            AI Mentor interactions utilize server-side request proxies without storing your personal data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2 text-slate-700 bg-white hover:bg-[#F0FAF9] border border-slate-200 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0A858C]" />
            <span>Export Data as JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={resetAllData}
            className="flex items-center gap-1.5 px-4 py-2 text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Reset All Saved Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
