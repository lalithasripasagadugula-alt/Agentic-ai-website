import React, { useState } from 'react';
import {
  Compass,
  User as UserIcon,
  LogOut,
  Sliders,
  Menu,
  X,
  Bot,
  AlertTriangle,
  Cloud,
  CloudCheck,
  RefreshCw,
  LogIn,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FirebaseSetupModal } from '../common/FirebaseSetupModal';

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
    setActiveTab,
    risks,
    isAssistantDrawerOpen,
    setIsAssistantDrawerOpen,
    firebaseUser,
    cloudSyncStatus,
    lastCloudSync,
    firebaseSignOut,
    syncToFirestoreNow,
  } = useApp();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'auth' | 'studentid' | 'troubleshoot'>('auth');
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const openRisksCount = risks.filter((r) => r.status === 'Open').length;

  const handleManualSync = async () => {
    setIsSyncingManual(true);
    const ok = await syncToFirestoreNow();
    if (!ok) {
      setModalInitialTab('troubleshoot');
      setShowAuthModal(true);
    }
    setTimeout(() => setIsSyncingManual(false), 600);
  };

  return (
    <>
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
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-[#0B757B]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#0B757B]" />
                )}
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

            {/* Center: Quick Risk Indicator & Firestore Status */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Firestore Connected Badge */}
              <button
                onClick={handleManualSync}
                title={`Firestore Database: proact-ai-ff60d ${lastCloudSync ? `(Synced at ${lastCloudSync})` : ''}`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-[#F0FAF9] border-[#77DAD7]/50 text-[#0B757B] hover:bg-[#A5E6E2]/30 transition-all cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-[#0A858C]" />
                <span>Firestore:</span>
                <span className="font-bold">proact-ai-ff60d</span>
                <RefreshCw
                  className={`w-3 h-3 text-[#0A858C] ${
                    cloudSyncStatus === 'syncing' || isSyncingManual ? 'animate-spin' : ''
                  }`}
                />
              </button>

              {isProfileComplete && openRisksCount > 0 && (
                <button
                  onClick={() => setActiveTab('risks')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>
                    {openRisksCount} Academic Risk{openRisksCount > 1 ? 's' : ''} Identified
                  </span>
                </button>
              )}
            </div>

            {/* Right: AI Assistant Drawer Trigger & Auth/Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Manual Cloud Sync Button */}
              <button
                onClick={handleManualSync}
                className="p-2 rounded-lg text-slate-600 hover:text-[#0B757B] hover:bg-[#F0FAF9] transition-colors relative"
                title={lastCloudSync ? `Sync to Cloud (Last synced: ${lastCloudSync})` : 'Sync to Firestore'}
              >
                <RefreshCw
                  className={`w-4 h-4 text-[#0B757B] ${
                    cloudSyncStatus === 'syncing' || isSyncingManual ? 'animate-spin' : ''
                  }`}
                />
              </button>

              {/* AI Mentor Drawer Trigger */}
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

              {/* Profile or Firebase Sign In */}
              {firebaseUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F0FAF9] transition-colors cursor-pointer"
                  >
                    {firebaseUser.photoURL ? (
                      <img
                        src={firebaseUser.photoURL}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full ring-2 ring-[#77DAD7]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#0B757B] text-white font-bold text-xs flex items-center justify-center ring-2 ring-[#A5E6E2]">
                        {firebaseUser.displayName
                          ? firebaseUser.displayName.charAt(0).toUpperCase()
                          : student?.fullName
                          ? student.fullName.charAt(0).toUpperCase()
                          : 'S'}
                      </div>
                    )}
                    <div className="text-left hidden lg:block leading-tight">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                        {firebaseUser.displayName || student?.fullName || 'Student'}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Firestore Synced
                      </p>
                    </div>
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-68 bg-white rounded-xl shadow-xl border border-[#A5E6E2]/60 p-2 z-50">
                      <div className="p-2.5 rounded-lg bg-[#F0FAF9] mb-2 border border-[#A5E6E2]/40">
                        <p className="text-xs font-bold text-[#0B757B]">
                          {firebaseUser.displayName || student?.fullName || 'Authenticated Student'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{firebaseUser.email}</p>
                        <div className="flex items-center gap-1 text-[10px] text-[#0A858C] font-mono mt-1">
                          <Database className="w-3 h-3" />
                          <span>Connected: proact-ai-ff60d</span>
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
                          <UserIcon className="w-4 h-4 text-[#0A858C]" />
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
                          Firebase Settings & Cloud Sync
                        </button>
                        <button
                          onClick={async () => {
                            await syncToFirestoreNow();
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors text-left font-medium"
                        >
                          <RefreshCw className="w-4 h-4 text-emerald-600" />
                          Push Records to Firestore
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          onClick={() => {
                            firebaseSignOut();
                            logout();
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors text-left font-medium"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          Sign Out of Firebase
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : isProfileComplete && student ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F0FAF9] text-[#0B757B] hover:bg-[#A5E6E2]/40 border border-[#77DAD7]/70 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Connect Firebase</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="w-8 h-8 rounded-full bg-[#0B757B] text-white font-bold text-xs flex items-center justify-center ring-2 ring-[#A5E6E2]"
                    >
                      {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
                    </button>

                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-[#A5E6E2]/60 p-2 z-50">
                        <div className="p-2.5 rounded-lg bg-[#F0FAF9] mb-2 border border-[#A5E6E2]/40">
                          <p className="text-xs font-bold text-[#0B757B]">{student.fullName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{student.email}</p>
                          <p className="text-[10px] text-amber-600 font-medium mt-1">Local Browser Cache</p>
                        </div>
                        <div className="space-y-1 text-xs">
                          <button
                            onClick={() => {
                              setActiveTab('profile');
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 rounded-lg hover:bg-[#F0FAF9] transition-colors text-left font-medium"
                          >
                            <UserIcon className="w-4 h-4 text-[#0A858C]" />
                            Profile Details
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab('settings');
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 rounded-lg hover:bg-[#F0FAF9] transition-colors text-left font-medium"
                          >
                            <Sliders className="w-4 h-4 text-[#0A858C]" />
                            Settings & Cloud
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
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F0FAF9] text-[#0B757B] border border-[#77DAD7]/70 hover:bg-[#A5E6E2]/40 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Firebase Sign In</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0B757B] text-white hover:bg-[#0A858C] transition-colors shadow-xs cursor-pointer"
                  >
                    Set Up Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Firebase Setup & Sign In Modal */}
      <FirebaseSetupModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab={modalInitialTab}
      />
    </>
  );
};
