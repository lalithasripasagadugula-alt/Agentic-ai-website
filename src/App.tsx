import React, { useState } from 'react';
import { useApp, AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { WelcomePage } from './components/pages/WelcomePage';
import { ProfileSetupPage } from './components/pages/ProfileSetupPage';
import { PersonalizedDashboard } from './components/pages/PersonalizedDashboard';
import { SubjectManagementPage } from './components/pages/SubjectManagementPage';
import { AttendanceCalendarPage } from './components/pages/AttendanceCalendarPage';
import { TodoListPage } from './components/pages/TodoListPage';
import { AcademicRisksPage } from './components/pages/AcademicRisksPage';
import { RecoverySchedulePage } from './components/pages/RecoverySchedulePage';
import { AIMentorPage } from './components/pages/AIMentorPage';
import { ProgressAnalyticsPage } from './components/pages/ProgressAnalyticsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { FloatingAIAssistant } from './components/common/FloatingAIAssistant';

function MainLayout() {
  const { isProfileComplete, activeTab } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveContent = () => {
    // Stage 1: If profile is not complete, allow Home/Welcome or Profile Setup
    if (!isProfileComplete) {
      if (activeTab === 'profile') {
        return <ProfileSetupPage />;
      }
      return <WelcomePage />;
    }

    // Stage 2: Personalized Dashboard & Modules
    switch (activeTab) {
      case 'home':
        return <WelcomePage />;
      case 'dashboard':
        return <PersonalizedDashboard />;
      case 'subjects':
        return <SubjectManagementPage />;
      case 'attendance':
        return <AttendanceCalendarPage />;
      case 'todos':
        return <TodoListPage />;
      case 'risks':
        return <AcademicRisksPage />;
      case 'schedule':
        return <RecoverySchedulePage />;
      case 'mentor':
        return <AIMentorPage />;
      case 'analytics':
        return <ProgressAnalyticsPage />;
      case 'profile':
        return <ProfileSetupPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <PersonalizedDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FAF9] flex flex-col text-slate-900">
      {/* Top Navigation */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 min-w-0 transition-all">
          <div className="max-w-6xl mx-auto space-y-6">
            {renderActiveContent()}
          </div>
        </main>
      </div>

      {/* Floating AI Mentor Drawer */}
      <FloatingAIAssistant />

      {/* Subtle Footer */}
      <footer className="lg:pl-64 border-t border-[#A5E6E2]/30 bg-white/60 py-4 px-6 text-center text-xs text-slate-400">
        <p>
          ProAct AI Student Agent · Personal AI-powered academic success & risk management companion.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
