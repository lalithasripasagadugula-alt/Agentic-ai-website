import React from 'react';
import {
  Compass,
  ArrowRight,
  ShieldAlert,
  CalendarDays,
  CheckSquare,
  Clock,
  Bot,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WelcomePage: React.FC = () => {
  const { setActiveTab, loadSampleTemplate, isProfileComplete } = useApp();

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[#A5E6E2]/60 shadow-xs text-center space-y-6 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0FAF9] border border-[#77DAD7]/60 text-[#0B757B] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#0A858C]" />
          <span>Stage 1: Student Onboarding</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B757B] tracking-tight">
            Welcome to ProAct AI Student Agent
          </h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto font-medium">
            Your personal AI-powered academic success companion.
          </p>
        </div>

        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          ProAct AI monitors your course attendance, analyzes internal assessment marks, identifies academic risks,
          and calculates an adaptive recovery schedule based strictly on the information you provide.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('profile')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>{isProfileComplete ? 'View / Edit My Profile' : 'Set Up My Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isProfileComplete && (
            <button
              onClick={loadSampleTemplate}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-[#F0FAF9] hover:bg-[#A5E6E2]/40 text-[#0B757B] border border-[#77DAD7]/70 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Loads sample academic records for instant evaluation"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0A858C]" />
              <span>Load Sample Template (Aarav Sharma)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('feedback')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Open the student intake & feedback form"
          >
            <span>Student Form (n8n)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#A5E6E2]/40 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[#F0FAF9] text-[#0B757B] flex items-center justify-center border border-[#77DAD7]/40">
            <CalendarDays className="w-5 h-5 text-[#0A858C]" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Attendance Calendar</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Record daily classes as Present, Absent, or Excused with mathematical projections of classes needed to stay safe.
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#A5E6E2]/40 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[#F0FAF9] text-[#0B757B] flex items-center justify-center border border-[#77DAD7]/40">
            <ShieldAlert className="w-5 h-5 text-[#0A858C]" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Academic Risk Engine</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Detects attendance deficits, low test marks, and competing deadlines with root-cause explanations.
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#A5E6E2]/40 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[#F0FAF9] text-[#0B757B] flex items-center justify-center border border-[#77DAD7]/40">
            <Clock className="w-5 h-5 text-[#0A858C]" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Recovery Schedule</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Builds a realistic daily revision schedule that adapts as tasks are completed or missed.
          </p>
        </div>
      </div>
    </div>
  );
};
