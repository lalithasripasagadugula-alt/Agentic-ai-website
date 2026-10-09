import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  Trash2,
  Plus,
  RefreshCw,
  AlertTriangle,
  BookOpen,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScheduledTask } from '../../types';

export const RecoverySchedulePage: React.FC = () => {
  const {
    schedule,
    generateSchedule,
    toggleScheduleTaskComplete,
    deleteScheduleTask,
    student,
    subjects,
    risks,
  } = useApp();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'all'>('weekly');
  const [isGenerating, setIsGenerating] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateSchedule();
      setIsGenerating(false);
    }, 400);
  };

  const completedCount = schedule.filter((s) => s.completed).length;
  const progressPercent = schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0;

  // Filter based on view mode
  const filteredSchedule = schedule.filter((task) => {
    if (viewMode === 'daily') return task.date === todayStr;
    if (viewMode === 'weekly') {
      const taskDate = new Date(task.date);
      const todayDate = new Date(todayStr);
      const diffDays = (taskDate.getTime() - todayDate.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B757B]">
              Personalized Academic Recovery Schedule
            </h1>
            <span className="text-xs font-semibold text-[#0A858C] bg-[#F0FAF9] border border-[#77DAD7]/50 px-2.5 py-0.5 rounded-full">
              {progressPercent}% Tasks Completed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Adapts study blocks to your available daily budget ({student?.dailyStudyHours || 3} hrs/day, {student?.preferredStudyTime || 'Evening'} slots).
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || subjects.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start md:self-center shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Calculating Schedule...' : 'Generate My Recovery Schedule'}</span>
        </button>
      </div>

      {/* Rationale and Strategy Explanation */}
      <div className="bg-white rounded-2xl p-5 border border-[#A5E6E2]/50 shadow-xs space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-[#0B757B]">
          <Sparkles className="w-4 h-4 text-[#0A858C]" />
          <span>Scheduler Architecture & Rules</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          The Recovery Engine allocates structured 45–90 minute focus blocks avoiding schedule overlap. High-severity
          attendance deficits and approaching deadlines receive first priority, followed by reinforcement for subjects
          marked with Hard difficulty.
        </p>
      </div>

      {/* View Switcher */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#A5E6E2]/50">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-[#0B757B] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0B757B] hover:bg-[#F0FAF9]'
            }`}
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-[#0B757B] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0B757B] hover:bg-[#F0FAF9]'
            }`}
          >
            7-Day Recovery Plan
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'all'
                ? 'bg-[#0B757B] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0B757B] hover:bg-[#F0FAF9]'
            }`}
          >
            All Scheduled ({schedule.length})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:block">
          Click checkbox to mark study session complete
        </span>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-3">
        {filteredSchedule.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-[#A5E6E2]/50 text-center space-y-2">
            <Clock className="w-10 h-10 text-[#77DAD7] mx-auto" />
            <h2 className="text-sm font-bold text-slate-800">No Recovery Tasks Scheduled</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {subjects.length === 0
                ? 'Add your subjects first so the scheduler can allocate balanced revision blocks.'
                : 'Click "Generate My Recovery Schedule" to calculate your personalized 7-day plan.'}
            </p>
          </div>
        ) : (
          filteredSchedule.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                task.completed
                  ? 'bg-slate-50/60 border-slate-200 opacity-60'
                  : 'bg-white border-[#A5E6E2]/60 hover:border-[#36B8B7]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleScheduleTaskComplete(task.id)}
                  className="mt-1 w-4 h-4 rounded text-[#0B757B] border-[#77DAD7] focus:ring-[#36B8B7] cursor-pointer"
                />

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-[#0B757B] bg-[#F0FAF9] px-2 py-0.5 rounded border border-[#77DAD7]/40">
                      {task.subjectName}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-medium text-slate-500">
                      {task.date} ({task.startTime} – {task.endTime})
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {task.durationMinutes} mins
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-bold ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {task.taskDescription}
                  </h3>

                  <p className="text-xs text-slate-500">
                    <strong className="text-slate-700">Rationale: </strong>
                    {task.relatedRiskOrGoal}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    task.priority === 'Urgent'
                      ? 'bg-rose-100 text-rose-800'
                      : task.priority === 'High'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#A5E6E2]/40 text-[#0B757B]'
                  }`}
                >
                  {task.priority}
                </span>

                <button
                  onClick={() => deleteScheduleTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Remove task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
