import React from 'react';
import {
  Home,
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  CheckSquare,
  AlertTriangle,
  Clock,
  Bot,
  BarChart3,
  User,
  SlidersHorizontal,
  LogOut,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    isProfileComplete,
    student,
    risks,
    todos,
    logout,
    resetAllData,
  } = useApp();

  const openRisksCount = risks.filter((r) => r.status === 'Open').length;
  const pendingTodosCount = todos.filter((t) => !t.completed).length;

  const navItems = [
    { id: 'home' as NavigationTab, label: 'Home', icon: Home },
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      requiresProfile: true,
    },
    {
      id: 'subjects' as NavigationTab,
      label: 'My Subjects',
      icon: BookOpen,
      requiresProfile: true,
    },
    {
      id: 'attendance' as NavigationTab,
      label: 'Attendance Calendar',
      icon: CalendarDays,
      requiresProfile: true,
    },
    {
      id: 'todos' as NavigationTab,
      label: 'To-Do List',
      icon: CheckSquare,
      badge: pendingTodosCount > 0 ? pendingTodosCount : undefined,
      badgeColor: 'bg-[#A5E6E2]/50 text-[#0B757B]',
      requiresProfile: true,
    },
    {
      id: 'risks' as NavigationTab,
      label: 'Academic Risks',
      icon: AlertTriangle,
      badge: openRisksCount > 0 ? `${openRisksCount}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      requiresProfile: true,
    },
    {
      id: 'schedule' as NavigationTab,
      label: 'Recovery Schedule',
      icon: Clock,
      requiresProfile: true,
    },
    {
      id: 'mentor' as NavigationTab,
      label: 'AI Mentor',
      icon: Bot,
      requiresProfile: true,
    },
    {
      id: 'analytics' as NavigationTab,
      label: 'Progress Analytics',
      icon: BarChart3,
      requiresProfile: true,
    },
    {
      id: 'profile' as NavigationTab,
      label: 'My Profile',
      icon: User,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: SlidersHorizontal,
      requiresProfile: true,
    },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-white border-r border-[#A5E6E2]/40 z-40 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Student Mini Banner if Profile Complete */}
        {isProfileComplete && student && (
          <div className="p-4 border-b border-[#A5E6E2]/30 bg-[#F0FAF9]/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B757B] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{student.fullName}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#0A858C] font-mono">
                  <span>{student.studentId}</span>
                  <span>·</span>
                  <span>{student.semester}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLocked = item.requiresProfile && !isProfileComplete;

            return (
              <button
                key={item.id}
                disabled={isLocked}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all group text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#0B757B] text-white shadow-xs'
                    : isLocked
                    ? 'text-slate-300 cursor-not-allowed hover:bg-transparent'
                    : 'text-slate-600 hover:text-[#0B757B] hover:bg-[#F0FAF9]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-white'
                        : isLocked
                        ? 'text-slate-300'
                        : 'text-[#0A858C] group-hover:text-[#0B757B]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && !isLocked && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1.5 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="p-3 border-t border-[#A5E6E2]/30 bg-[#F0FAF9]/40 space-y-1.5">
          {isProfileComplete ? (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('profile')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-[#0B757B] hover:bg-[#0A858C] rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Set Up My Profile</span>
            </button>
          )}

          <button
            onClick={resetAllData}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="Clear all stored student data"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Saved Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
