import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  AlertCircle,
  Filter,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TodoTask } from '../../types';

export const TodoListPage: React.FC = () => {
  const { todos, addTodo, updateTodo, toggleTodoComplete, deleteTodo, subjects } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');
  const [notes, setNotes] = useState('');

  // Filters state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue' | 'today'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const resetForm = () => {
    setTitle('');
    setSelectedSubjectId(subjects[0]?.id || '');
    setDeadline(todayStr);
    setPriority('High');
    setNotes('');
    setEditingTodoId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (t: TodoTask) => {
    setEditingTodoId(t.id);
    setTitle(t.title);
    setSelectedSubjectId(t.subjectId || '');
    setDeadline(t.deadline || todayStr);
    setPriority(t.priority);
    setNotes(t.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedSub = subjects.find((s) => s.id === selectedSubjectId);

    if (editingTodoId) {
      updateTodo(editingTodoId, {
        title: title.trim(),
        subjectId: selectedSubjectId || undefined,
        subjectName: matchedSub?.name || 'General',
        deadline,
        priority,
        notes: notes.trim() || undefined,
      });
    } else {
      addTodo({
        title: title.trim(),
        subjectId: selectedSubjectId || undefined,
        subjectName: matchedSub?.name || 'General',
        deadline,
        priority,
        notes: notes.trim() || undefined,
        completed: false,
      });
    }

    setShowModal(false);
    resetForm();
  };

  // Filter logic
  const filteredTodos = todos.filter((t) => {
    // Status filter
    if (statusFilter === 'pending' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (statusFilter === 'overdue') {
      if (t.completed) return false;
      const isOverdue = t.deadline && t.deadline < todayStr;
      if (!isOverdue) return false;
    }
    if (statusFilter === 'today') {
      if (t.deadline !== todayStr) return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    // Subject filter
    if (subjectFilter !== 'all' && t.subjectId !== subjectFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B757B]">To-Do List & Task Management</h1>
            <span className="text-xs font-semibold text-[#0A858C] bg-[#F0FAF9] border border-[#77DAD7]/50 px-2.5 py-0.5 rounded-full">
              {progressPercent}% Completed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize coursework deliverables, lab submissions, and study goals with automatic risk engine sync.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start md:self-center shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-[#A5E6E2]/50 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Overall Task Completion</span>
            <span className="font-mono font-bold text-[#0B757B]">
              {completedCount} of {totalCount} tasks completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-[#F0FAF9] rounded-full h-2.5 overflow-hidden border border-[#A5E6E2]/40">
            <div
              className="bg-[#0B757B] h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#A5E6E2]/50 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: `All (${todos.length})` },
            { id: 'pending', label: `Pending (${todos.filter((t) => !t.completed).length})` },
            { id: 'today', label: 'Due Today' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: `Done (${completedCount})` },
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
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 bg-white border border-[#A5E6E2]/70 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Subject filter */}
          {subjects.length > 0 && (
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="p-2 bg-white border border-[#A5E6E2]/70 rounded-xl text-slate-700 focus:outline-hidden max-w-[160px]"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-[#A5E6E2]/50 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredTodos.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <CheckSquare className="w-10 h-10 text-[#77DAD7] mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Tasks in this View</h3>
            <p className="text-xs text-slate-500">
              {todos.length === 0
                ? "You haven't added any tasks yet. Click 'Add New Task' to begin organizing your assignments."
                : 'No tasks match the selected filter criteria.'}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const isOverdue = !todo.completed && todo.deadline && todo.deadline < todayStr;
            const isDueToday = !todo.completed && todo.deadline === todayStr;

            return (
              <div
                key={todo.id}
                className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                  todo.completed ? 'bg-slate-50/50 opacity-60' : 'hover:bg-[#F0FAF9]/40'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodoComplete(todo.id)}
                    className="mt-1 w-4 h-4 rounded text-[#0B757B] border-[#77DAD7] focus:ring-[#36B8B7] cursor-pointer"
                  />

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-[#0B757B] bg-[#F0FAF9] px-2 py-0.5 rounded border border-[#77DAD7]/40">
                        {todo.subjectName}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          todo.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : todo.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#A5E6E2]/40 text-[#0B757B]'
                        }`}
                      >
                        {todo.priority}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold ${
                        todo.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {todo.title}
                    </h3>

                    {todo.notes && (
                      <p className="text-xs text-slate-500 leading-relaxed">{todo.notes}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span
                        className={`flex items-center gap-1 font-mono ${
                          isOverdue
                            ? 'text-rose-600 font-bold'
                            : isDueToday
                            ? 'text-amber-600 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {isOverdue
                          ? `Overdue: ${todo.deadline}`
                          : isDueToday
                          ? 'Due Today'
                          : `Due: ${todo.deadline}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(todo)}
                    className="p-1.5 text-slate-400 hover:text-[#0B757B] rounded-lg hover:bg-[#F0FAF9] transition-colors cursor-pointer"
                    title="Edit task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-[#0B757B]">
              {editingTodoId ? 'Edit Task Details' : 'Add New Task / Assignment'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dynamic Programming Assignment 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden"
                  >
                    <option value="">General Coursework</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden"
                >
                  <option value="Urgent">Urgent (Highest focus)</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Problem numbers, file links, or submission details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                  {editingTodoId ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
