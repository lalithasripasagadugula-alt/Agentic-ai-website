import React, { useState } from 'react';
import {
  Compass,
  User,
  LogOut,
  Sliders,
  Menu,
  X,
  Sparkles,
  Bot,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const {
    student,
    isProfileComplete,
    logout,
    activeTab,
    setActiveTab,
    risks,
    isAssistantDrawerOpen,
    setIsAssistantDrawerOpen,
  } = useApp();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const openRisksCount = risks.filter((r) => r.status === 'Open').length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#A5E6E2]/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-[#F0FAF9] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[#0B757B]" /> : <Menu className="w-5 h-5 text-[#0B757B]" />}
            </button>

            <button
              onClick={() => setActiveTab(isProfileComplete ? 'dashboard' : 'home')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B757B] via-[#0A858C] to-[#36B8B7] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-[#0B757B]">
                    ProAct AI
                  </span>
                  <span className="text-[11px] font-semibold text-[#0A858C] bg-[#A5E6E2]/30 border border-[#77DAD7]/50 px-2 py-0.5 rounded-full">
                    Student Agent
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
                  Academic Success & Risk Engine
                </p>
              </div>
            </button>
          </div>

          {/* Center: Quick Risk Indicator */}
          {isProfileComplete && openRisksCount > 0 && (
            <button
              onClick={() => setActiveTab('risks')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{openRisksCount} Academic Risk{openRisksCount > 1 ? 's' : ''} Identified</span>
            </button>
          )}

          {/* Right: AI Assistant Drawer Trigger & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsAssistantDrawerOpen(!isAssistantDrawerOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isAssistantDrawerOpen
                  ? 'bg-[#0B757B] text-white border-[#0B757B]'
                  : 'bg-[#F0FAF9] text-[#0B757B] border-[#77DAD7]/60 hover:bg-[#A5E6E2]/30'
              }`}
              title="Open ProAct AI Mentor"
            >
              <Bot className="w-4 h-4 text-[#0A858C]" />
              <span className="hidden sm:inline">AI Mentor</span>
            </button>

            {isProfileComplete && student ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F0FAF9] transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0B757B] text-white font-bold text-xs flex items-center justify-center ring-2 ring-[#A5E6E2]">
                    {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="text-left hidden lg:block leading-tight">
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                      {student.fullName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {student.studentId}
                    </p>
                  </div>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#A5E6E2]/60 p-2 z-50">
                    <div className="p-2.5 rounded-lg bg-[#F0FAF9] mb-2 border border-[#A5E6E2]/40">
                      <p className="text-xs font-bold text-[#0B757B]">{student.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{student.email}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                        <span>{student.studentId}</span>
                        <span>·</span>
                        <span>{student.semester}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 rounded-lg hover:bg-[#F0FAF9] transition-colors text-left font-medium"
                      >
                        <User className="w-4 h-4 text-[#0A858C]" />
                        My Profile Details
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 rounded-lg hover:bg-[#F0FAF9] transition-colors text-left font-medium"
                      >
                        <Sliders className="w-4 h-4 text-[#0A858C]" />
                        Settings & Targets
                      </button>
                      <div className="h-px bg-slate-100 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('profile')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0B757B] text-white hover:bg-[#0A858C] transition-colors shadow-xs cursor-pointer"
              >
                Set Up Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
