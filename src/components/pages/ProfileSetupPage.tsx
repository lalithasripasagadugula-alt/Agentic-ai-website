import React, { useState } from 'react';
import {
  User,
  Mail,
  Building,
  GraduationCap,
  Hash,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentProfile } from '../../types';

export const ProfileSetupPage: React.FC = () => {
  const { student, saveProfile, isProfileComplete, loadSampleTemplate } = useApp();

  const [fullName, setFullName] = useState(student?.fullName || '');
  const [email, setEmail] = useState(student?.email || '');
  const [collegeName, setCollegeName] = useState(student?.collegeName || '');
  const [branch, setBranch] = useState(student?.branch || '');
  const [academicYear, setAcademicYear] = useState(student?.academicYear || '3rd Year');
  const [semester, setSemester] = useState(student?.semester || 'Semester VI');
  const [studentId, setStudentId] = useState(student?.studentId || '');

  // Optional fields
  const [dailyStudyHours, setDailyStudyHours] = useState(student?.dailyStudyHours || 3);
  const [preferredStudyTime, setPreferredStudyTime] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>(
    student?.preferredStudyTime || 'Evening'
  );
  const [academicGoals, setAcademicGoals] = useState(student?.academicGoals || '');
  const [existingDifficulties, setExistingDifficulties] = useState(student?.existingDifficulties || '');
  const [attendanceTargetPercent, setAttendanceTargetPercent] = useState(
    student?.attendanceTargetPercent || 75
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successNotice, setSuccessNotice] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!email.trim()) {
      errs.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address (e.g. name@college.edu).';
    }
    if (!collegeName.trim()) errs.collegeName = 'College / Institution Name is required.';
    if (!branch.trim()) errs.branch = 'Branch / Department is required.';
    if (!studentId.trim()) errs.studentId = 'Student ID or Roll Number is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const profileData: StudentProfile = {
      fullName: fullName.trim(),
      email: email.trim(),
      collegeName: collegeName.trim(),
      branch: branch.trim(),
      academicYear,
      semester,
      studentId: studentId.trim(),
      dailyStudyHours: Number(dailyStudyHours) || 3,
      preferredStudyTime,
      academicGoals: academicGoals.trim(),
      existingDifficulties: existingDifficulties.trim(),
      attendanceTargetPercent: Number(attendanceTargetPercent) || 75,
      isProfileComplete: true,
    };

    saveProfile(profileData);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B757B]">
              {isProfileComplete ? 'My Student Profile' : 'Student Setup — Manual Profile Registration'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isProfileComplete
              ? 'Update your academic registration, degree details, and target preferences.'
              : 'Enter your verified collegiate credentials to activate your personalized success dashboard.'}
          </p>
        </div>

        {!isProfileComplete && (
          <button
            type="button"
            onClick={loadSampleTemplate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#F0FAF9] text-[#0B757B] border border-[#77DAD7] hover:bg-[#A5E6E2]/30 rounded-lg transition-colors shrink-0 self-start sm:self-center cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0A858C]" />
            <span>Fill Sample Template</span>
          </button>
        )}
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl bg-[#F0FAF9] border border-[#36B8B7] text-[#0B757B] text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#0A858C]" />
          <span className="font-semibold">Profile details saved successfully! Dashboard activated.</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#A5E6E2]/60 shadow-xs space-y-6">
        {/* Section 1: Required Identity Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-[#0B757B] uppercase tracking-wider">
              1. Institutional Identity <span className="text-rose-500">* (Required)</span>
            </h2>
            <span className="text-[11px] text-slate-400">All fields required for record isolation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full text-xs pl-9 pr-3 py-2.5 bg-[#F0FAF9]/50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7] ${
                    errors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-[#A5E6E2]/70'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Collegiate Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="e.g. student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full text-xs pl-9 pr-3 py-2.5 bg-[#F0FAF9]/50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7] ${
                    errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-[#A5E6E2]/70'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            {/* College Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                College / Institution Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. National Institute of Technology"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className={`w-full text-xs pl-9 pr-3 py-2.5 bg-[#F0FAF9]/50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7] ${
                    errors.collegeName ? 'border-rose-400 bg-rose-50/30' : 'border-[#A5E6E2]/70'
                  }`}
                />
              </div>
              {errors.collegeName && <p className="text-[11px] text-rose-500 mt-1">{errors.collegeName}</p>}
            </div>

            {/* Branch / Department */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Branch / Department <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className={`w-full text-xs pl-9 pr-3 py-2.5 bg-[#F0FAF9]/50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7] ${
                    errors.branch ? 'border-rose-400 bg-rose-50/30' : 'border-[#A5E6E2]/70'
                  }`}
                />
              </div>
              {errors.branch && <p className="text-[11px] text-rose-500 mt-1">{errors.branch}</p>}
            </div>

            {/* Academic Year */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Current Academic Year <span className="text-rose-500">*</span>
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Semester <span className="text-rose-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
              >
                {['Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Student ID / Roll Number */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Student ID / Roll Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. 22CS104"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className={`w-full text-xs pl-9 pr-3 py-2.5 bg-[#F0FAF9]/50 border rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7] ${
                    errors.studentId ? 'border-rose-400 bg-rose-50/30' : 'border-[#A5E6E2]/70'
                  }`}
                />
              </div>
              {errors.studentId && <p className="text-[11px] text-rose-500 mt-1">{errors.studentId}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Optional Academic Preferences */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-[#0B757B] uppercase tracking-wider">
              2. Academic Targets & Study Preferences (Optional)
            </h2>
            <span className="text-[11px] text-slate-400">Used by Risk Engine & Recovery Scheduler</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Attendance Target */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Institutional Attendance Target (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={attendanceTargetPercent}
                  onChange={(e) => setAttendanceTargetPercent(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                />
                <span className="text-xs font-mono font-bold text-[#0B757B]">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Default is 75% for most universities.</p>
            </div>

            {/* Daily Study Hours */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Available Daily Study Hours (Budget)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={dailyStudyHours}
                  onChange={(e) => setDailyStudyHours(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                />
                <span className="text-xs text-slate-500 font-medium">hrs/day</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Used to prevent study plan overload.</p>
            </div>

            {/* Preferred Study Time */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Preferred Study Time
              </label>
              <select
                value={preferredStudyTime}
                onChange={(e) => setPreferredStudyTime(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
              >
                <option value="Morning">Morning (08:00 - 12:00)</option>
                <option value="Afternoon">Afternoon (14:00 - 17:00)</option>
                <option value="Evening">Evening (18:00 - 21:00)</option>
                <option value="Night">Night (21:00 - 00:00)</option>
              </select>
            </div>

            {/* Academic Goals */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Current Semester Academic Goals
              </label>
              <input
                type="text"
                placeholder="e.g. Clear semester with GPA > 8.5 without backlogs"
                value={academicGoals}
                onChange={(e) => setAcademicGoals(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
              />
            </div>

            {/* Existing Difficulties */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Existing Academic Difficulties / Weak Areas
              </label>
              <input
                type="text"
                placeholder="e.g. Difficulty in Algorithms Dynamic Programming, tight networking lab deadlines"
                value={existingDifficulties}
                onChange={(e) => setExistingDifficulties(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            Records are persisted locally in browser storage for privacy.
          </p>

          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span>Save Profile & Continue to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
