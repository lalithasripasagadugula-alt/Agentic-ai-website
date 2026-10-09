import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Calendar,
  Award,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import {
  calculateAttendancePercentage,
  calculateClassesNeededForTarget,
  calculateSafeClassesToMiss,
  getAttendanceStatus,
} from '../../utils/academicCalculations';

export const SubjectManagementPage: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, student } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [faculty, setFaculty] = useState('');
  const [totalClasses, setTotalClasses] = useState(30);
  const [attendedClasses, setAttendedClasses] = useState(24);
  const [targetAttendance, setTargetAttendance] = useState(student?.attendanceTargetPercent || 75);
  const [internalMarksObtained, setInternalMarksObtained] = useState<number | ''>('');
  const [maxInternalMarks, setMaxInternalMarks] = useState<number | ''>(30);
  const [upcomingAssessments, setUpcomingAssessments] = useState('');
  const [assignmentDeadlines, setAssignmentDeadlines] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const [formError, setFormError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setCode('');
    setFaculty('');
    setTotalClasses(30);
    setAttendedClasses(24);
    setTargetAttendance(student?.attendanceTargetPercent || 75);
    setInternalMarksObtained('');
    setMaxInternalMarks(30);
    setUpcomingAssessments('');
    setAssignmentDeadlines('');
    setDifficulty('Medium');
    setFormError('');
    setEditingSubjectId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubjectId(sub.id);
    setName(sub.name);
    setCode(sub.code);
    setFaculty(sub.faculty || '');
    setTotalClasses(sub.totalClasses);
    setAttendedClasses(sub.attendedClasses);
    setTargetAttendance(sub.targetAttendance);
    setInternalMarksObtained(sub.internalMarksObtained !== undefined ? sub.internalMarksObtained : '');
    setMaxInternalMarks(sub.maxInternalMarks !== undefined ? sub.maxInternalMarks : 30);
    setUpcomingAssessments(sub.upcomingAssessments || '');
    setAssignmentDeadlines(sub.assignmentDeadlines || '');
    setDifficulty(sub.difficulty);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Subject Name is required.');
      return;
    }
    if (attendedClasses > totalClasses) {
      setFormError('Classes attended cannot be greater than total classes conducted.');
      return;
    }
    if (
      internalMarksObtained !== '' &&
      maxInternalMarks !== '' &&
      Number(internalMarksObtained) > Number(maxInternalMarks)
    ) {
      setFormError('Internal marks obtained cannot exceed maximum marks.');
      return;
    }

    const payload: Omit<Subject, 'id'> = {
      name: name.trim(),
      code: code.trim(),
      faculty: faculty.trim() || undefined,
      totalClasses: Number(totalClasses) || 0,
      attendedClasses: Number(attendedClasses) || 0,
      targetAttendance: Number(targetAttendance) || 75,
      internalMarksObtained: internalMarksObtained !== '' ? Number(internalMarksObtained) : undefined,
      maxInternalMarks: maxInternalMarks !== '' ? Number(maxInternalMarks) : undefined,
      upcomingAssessments: upcomingAssessments.trim() || undefined,
      assignmentDeadlines: assignmentDeadlines.trim() || undefined,
      difficulty,
    };

    if (editingSubjectId) {
      updateSubject(editingSubjectId, payload);
    } else {
      addSubject(payload);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteSubject(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B757B]">My Subjects</h1>
            <span className="text-xs font-semibold text-[#0A858C] bg-[#F0FAF9] border border-[#77DAD7]/50 px-2.5 py-0.5 rounded-full">
              {subjects.length} Course{subjects.length !== 1 ? 's' : ''} Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage course codes, attendance tallies, continuous internal marks, and syllabus difficulty.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-center shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-[#A5E6E2]/50 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-[#36B8B7] mx-auto" />
          <h2 className="text-sm font-bold text-slate-800">No Subjects Added Yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Add New Subject" to begin tracking your course attendance, internal test marks, and academic standing.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            + Add First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjects.map((sub) => {
            const pct = calculateAttendancePercentage(sub.attendedClasses, sub.totalClasses);
            const status = getAttendanceStatus(pct, sub.targetAttendance);
            const needed = calculateClassesNeededForTarget(sub.attendedClasses, sub.totalClasses, sub.targetAttendance);
            const safeToMiss = calculateSafeClassesToMiss(sub.attendedClasses, sub.totalClasses, sub.targetAttendance);

            const hasInternalMarks =
              sub.internalMarksObtained !== undefined &&
              sub.maxInternalMarks !== undefined &&
              sub.maxInternalMarks > 0;
            const marksPct = hasInternalMarks
              ? Math.round((sub.internalMarksObtained! / sub.maxInternalMarks!) * 100)
              : null;

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl p-5 border border-[#A5E6E2]/50 shadow-xs space-y-4 hover:border-[#36B8B7] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Code, Name, Difficulty */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {sub.code && (
                          <span className="text-xs font-mono font-bold text-[#0B757B] bg-[#F0FAF9] border border-[#77DAD7]/40 px-2 py-0.5 rounded">
                            {sub.code}
                          </span>
                        )}
                        <h2 className="text-sm font-bold text-slate-900">{sub.name}</h2>
                      </div>
                      {sub.faculty && (
                        <p className="text-[11px] text-slate-400 mt-0.5">Faculty: {sub.faculty}</p>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        sub.difficulty === 'Hard'
                          ? 'bg-rose-100 text-rose-800'
                          : sub.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#A5E6E2]/40 text-[#0B757B]'
                      }`}
                    >
                      {sub.difficulty}
                    </span>
                  </div>

                  {/* Attendance Bar & Statistics */}
                  <div className="p-3 rounded-xl bg-[#F0FAF9]/60 border border-[#A5E6E2]/40 space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        Attendance: {sub.attendedClasses}/{sub.totalClasses} classes
                      </span>
                      <span className={`text-base font-mono font-extrabold ${status.colorClass}`}>
                        {pct}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#0B757B] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-semibold ${status.colorClass}`}>
                        Target: {sub.targetAttendance}% · {status.label}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {needed > 0
                          ? `Must attend +${needed} consecutive`
                          : `Safe to miss: ${safeToMiss}`}
                      </span>
                    </div>
                  </div>

                  {/* Internal Marks if present */}
                  {hasInternalMarks && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs border border-slate-100">
                      <span className="text-slate-600 font-medium">Internal Assessment:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">
                          {sub.internalMarksObtained} / {sub.maxInternalMarks} ({marksPct}%)
                        </span>
                        {marksPct !== null && marksPct < 50 && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Low Score
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upcoming notes */}
                  {(sub.upcomingAssessments || sub.assignmentDeadlines) && (
                    <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                      {sub.upcomingAssessments && (
                        <p className="truncate">
                          <strong className="text-slate-700">Exam:</strong> {sub.upcomingAssessments}
                        </p>
                      )}
                      {sub.assignmentDeadlines && (
                        <p className="truncate">
                          <strong className="text-slate-700">Assignment:</strong> {sub.assignmentDeadlines}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(sub)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0B757B] hover:bg-[#F0FAF9] rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(sub.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete this subject? All associated daily attendance calendar records
              and risk calculations will be removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
              >
                Yes, Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <h3 className="text-base font-bold text-[#0B757B]">
              {editingSubjectId ? 'Edit Subject Details' : 'Add New Subject'}
            </h3>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Subject Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design & Analysis of Algorithms"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS301"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Faculty Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Suresh Varma"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                  />
                </div>
              </div>

              {/* Attendance Counts */}
              <div className="p-3.5 rounded-xl bg-[#F0FAF9]/60 border border-[#A5E6E2]/50 space-y-3">
                <span className="font-bold text-[#0B757B] block">Attendance Baseline</span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Total Classes</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={totalClasses}
                      onChange={(e) => setTotalClasses(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-[#A5E6E2] rounded-lg font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Classes Attended</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={attendedClasses}
                      onChange={(e) => setAttendedClasses(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-[#A5E6E2] rounded-lg font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target %</label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      required
                      value={targetAttendance}
                      onChange={(e) => setTargetAttendance(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-[#A5E6E2] rounded-lg font-mono focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Internal Marks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Internal Marks Obtained (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 24"
                    value={internalMarksObtained}
                    onChange={(e) => setInternalMarksObtained(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Maximum Internal Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 30"
                    value={maxInternalMarks}
                    onChange={(e) => setMaxInternalMarks(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                  />
                </div>
              </div>

              {/* Difficulty and Upcoming */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Upcoming Assessment Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Midterm on Nov 12"
                    value={upcomingAssessments}
                    onChange={(e) => setUpcomingAssessments(e.target.value)}
                    className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {editingSubjectId ? 'Save Changes' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
