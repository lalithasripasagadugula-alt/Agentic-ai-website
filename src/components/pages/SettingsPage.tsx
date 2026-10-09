import React, { useState } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Download,
  Database,
  RefreshCw,
  LogIn,
  LogOut,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Activity,
  Copy,
  Check,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  firebaseConfig,
  RECOMMENDED_FIRESTORE_RULES,
  FirebaseDiagnostic,
} from '../../firebase';
import { FirebaseSetupModal } from '../common/FirebaseSetupModal';

export const SettingsPage: React.FC = () => {
  const {
    student,
    saveProfile,
    resetAllData,
    firebaseUser,
    cloudSyncStatus,
    lastCloudSync,
    cloudError,
    signInWithGoogle,
    signInAsGuest,
    firebaseSignOut,
    syncToFirestoreNow,
    loadFromFirestoreNow,
    testCloudConnection,
  } = useApp();

  const [target, setTarget] = useState(student?.attendanceTargetPercent || 75);
  const [studyHours, setStudyHours] = useState(student?.dailyStudyHours || 3);
  const [saveNotice, setSaveNotice] = useState(false);
  const [testResult, setTestResult] = useState<FirebaseDiagnostic | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [firebaseModalTab, setFirebaseModalTab] = useState<'auth' | 'studentid' | 'troubleshoot'>('troubleshoot');
  const [hasCopiedRules, setHasCopiedRules] = useState(false);
  const [studentIdSyncInput, setStudentIdSyncInput] = useState(student?.studentId || '');

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

  const handleTestConnection = async () => {
    setIsTesting(true);
    const result = await testCloudConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const handleCopyRules = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(RECOMMENDED_FIRESTORE_RULES);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = RECOMMENDED_FIRESTORE_RULES;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setHasCopiedRules(true);
      setTimeout(() => setHasCopiedRules(false), 3000);
    } catch (err) {
      console.error('Failed to copy rules:', err);
    }
  };

  const handlePushToFirestore = async () => {
    const success = await syncToFirestoreNow();
    if (success) {
      setSyncFeedback('All student records, attendance, and tasks uploaded to Cloud Firestore successfully!');
    } else {
      setSyncFeedback('Sync initiated. Please make sure you are signed in.');
    }
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handlePullFromFirestore = async () => {
    const success = await loadFromFirestoreNow();
    if (success) {
      setSyncFeedback('Fetched latest records from Cloud Firestore successfully!');
    } else {
      setSyncFeedback('No cloud records found or sign-in required.');
    }
    setTimeout(() => setSyncFeedback(null), 4000);
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
        <h1 className="text-xl font-bold text-[#0B757B]">Settings & Cloud Integration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure Firebase Cloud Firestore persistence, attendance evaluation thresholds, and sync diagnostics.
        </p>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-xl bg-[#F0FAF9] border border-[#36B8B7] text-[#0B757B] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0A858C]" />
          <span className="font-semibold">Target preferences saved and recalculated successfully!</span>
        </div>
      )}

      {syncFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{syncFeedback}</span>
        </div>
      )}

      {/* Firebase Cloud Firestore Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FAF9] flex items-center justify-center border border-[#77DAD7]/50 text-[#0B757B]">
              <Database className="w-4 h-4 text-[#0A858C]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Firebase Cloud Firestore Database</h2>
              <p className="text-[11px] text-slate-400">Live persistence connected to Google Cloud</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </span>
        </div>

        {/* Project Credentials Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#F0FAF9]/60 border border-[#A5E6E2]/40 font-mono text-[11px]">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Firebase Project ID</span>
            <span className="text-slate-800 font-bold">{firebaseConfig.projectId}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Auth Domain</span>
            <span className="text-slate-800 font-bold truncate block">{firebaseConfig.authDomain}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Web App ID</span>
            <span className="text-slate-800 font-bold truncate block">{firebaseConfig.appId}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Cloud Sync State</span>
            <span className="text-[#0B757B] font-bold capitalize">
              {cloudSyncStatus} {lastCloudSync ? `(at ${lastCloudSync})` : ''}
            </span>
          </div>
        </div>

        {cloudError && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Sync Issue Detected:</p>
                <p className="mt-0.5 leading-relaxed">{cloudError}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1 border-t border-amber-200">
              <button
                type="button"
                onClick={() => {
                  setFirebaseModalTab('troubleshoot');
                  setShowFirebaseModal(true);
                }}
                className="font-bold text-[#0B757B] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View 1-Click Fix & Console Rules →</span>
              </button>
            </div>
          </div>
        )}

        {/* Auth Session Status */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-bold text-slate-800 text-xs">Authentication Status</p>
              <p className="text-slate-500 text-[11px]">
                {firebaseUser
                  ? `Signed in as ${firebaseUser.email || 'Guest Student'} (UID: ${firebaseUser.uid.substring(0, 10)}...)`
                  : 'Currently caching to browser storage. Sign in or use direct Student ID sync below to link records to Firestore.'}
              </p>
            </div>
            {firebaseUser ? (
              <button
                type="button"
                onClick={firebaseSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFirebaseModalTab('auth');
                    setShowFirebaseModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white bg-[#0B757B] hover:bg-[#0A858C] font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Connect</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Direct Student ID Cloud Backup & Retrieval */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs">Direct Student ID Cloud Sync</span>
            <span className="text-[10px] bg-[#F0FAF9] text-[#0B757B] border border-[#77DAD7]/50 px-2 py-0.5 rounded-full font-semibold">
              No Popups Required
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Push or pull academic records directly under your college Student ID / Roll Number in Firestore.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={studentIdSyncInput}
              onChange={(e) => setStudentIdSyncInput(e.target.value)}
              placeholder="e.g. 21BCE1042"
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B757B]"
            />
            <button
              type="button"
              onClick={async () => {
                const ok = await syncToFirestoreNow(studentIdSyncInput);
                if (ok) {
                  setSyncFeedback(`Student records pushed under ID "${studentIdSyncInput}"!`);
                } else {
                  setSyncFeedback('Sync failed. Check Firestore rules below.');
                }
                setTimeout(() => setSyncFeedback(null), 4000);
              }}
              className="px-3 py-1.5 bg-[#0B757B] text-white rounded-lg text-xs font-bold hover:bg-[#0A858C] cursor-pointer"
            >
              Push ID
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await loadFromFirestoreNow(studentIdSyncInput);
                if (ok) {
                  setSyncFeedback(`Retrieved records for "${studentIdSyncInput}"!`);
                } else {
                  setSyncFeedback(`No records found for "${studentIdSyncInput}".`);
                }
                setTimeout(() => setSyncFeedback(null), 4000);
              }}
              className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-300 cursor-pointer"
            >
              Pull ID
            </button>
          </div>
        </div>

        {/* Operations & Diagnostic Actions */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F0FAF9] text-[#0B757B] border border-[#77DAD7]/70 hover:bg-[#A5E6E2]/40 font-semibold transition-all cursor-pointer"
          >
            <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Test Firestore Connection</span>
          </button>

          <button
            type="button"
            onClick={handlePushToFirestore}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B757B] text-white hover:bg-[#0A858C] font-semibold transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Push All to Firestore</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFirebaseModalTab('troubleshoot');
              setShowFirebaseModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-semibold transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Setup & Rules Assistant</span>
          </button>
        </div>

        {/* Comprehensive Test Result Box */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border text-[11px] space-y-2.5 ${
              testResult.connected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                {testResult.connected ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-xs">{testResult.message}</p>
                  <p className="text-[11px] mt-0.5 opacity-90">{testResult.details}</p>
                </div>
              </div>

              {testResult.rulesStatus === 'rules_permission_denied' && (
                <button
                  type="button"
                  onClick={handleCopyRules}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0B757B] text-white font-bold text-xs hover:bg-[#0A858C] cursor-pointer shrink-0"
                >
                  {hasCopiedRules ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hasCopiedRules ? 'Copied!' : 'Copy Rules'}</span>
                </button>
              )}
            </div>

            {testResult.rulesStatus === 'rules_permission_denied' && (
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-[11px] space-y-2">
                <p className="font-semibold text-slate-800">
                  How to fix in 1 minute:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>
                    Click{' '}
                    <a
                      href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0B757B] font-bold underline inline-flex items-center gap-0.5"
                    >
                      Open Firestore Rules in Firebase Console
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </li>
                  <li>Click <strong>&quot;Copy Rules&quot;</strong> above, paste into the Rules tab, and click <strong>Publish</strong>.</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* n8n Cloud Automation Integration Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FAF9] flex items-center justify-center border border-[#77DAD7]/50 text-[#0B757B]">
              <Activity className="w-4 h-4 text-[#0A858C]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">n8n Cloud Automation Workflows</h2>
              <p className="text-[11px] text-slate-400">Live webhook pipelines connected to navyapriya.app.n8n.cloud</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>

        <div className="space-y-3">
          {/* Webhook 1: Chat Webhook */}
          <div className="p-3.5 rounded-xl bg-[#F0FAF9]/60 border border-[#A5E6E2]/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B757B]">1. AI Mentor Chat Webhook</span>
              <span className="text-[10px] bg-white border border-[#77DAD7]/60 text-[#0A858C] px-2 py-0.5 rounded font-mono">POST</span>
            </div>
            <p className="text-[11px] font-mono text-slate-700 break-all select-all">
              https://navyapriya.app.n8n.cloud/webhook/7dc90365-76de-4844-ae0c-6cfa50909a74/chat
            </p>
            <p className="text-[10px] text-slate-500">
              Powers intelligent replies in ProAct AI Mentor (with automated fallback to Gemini and academic rules).
            </p>
          </div>

          {/* Webhook 2: Student Feedback Form */}
          <div className="p-3.5 rounded-xl bg-[#F0FAF9]/60 border border-[#A5E6E2]/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B757B]">2. Student Intake & Feedback Form</span>
              <span className="text-[10px] bg-white border border-[#77DAD7]/60 text-[#0A858C] px-2 py-0.5 rounded font-mono">Form Embed</span>
            </div>
            <p className="text-[11px] font-mono text-slate-700 break-all select-all">
              https://navyapriya.app.n8n.cloud/form/4fdcbe98-0900-4da1-8db0-06a4315ae2c3
            </p>
            <p className="text-[10px] text-slate-500">
              Embedded on the dedicated "Student Form (n8n)" navigation tab.
            </p>
          </div>
        </div>
      </div>

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

      {/* Data Storage & Export */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <HardDrive className="w-4 h-4 text-[#0B757B]" />
          <h2 className="text-sm font-bold text-slate-800">Local & Cloud Backup</h2>
        </div>

        <div className="p-4 rounded-xl bg-[#F0FAF9]/60 border border-[#A5E6E2]/40 space-y-2 text-slate-600 leading-relaxed">
          <p>
            <strong>Dual-Layer Storage:</strong> Your records are synced in real time to Google Cloud Firestore (Project: <code className="font-mono text-[#0B757B]">proact-ai-ff60d</code>) and kept available in local browser offline storage for fast loading.
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

      {/* Firebase Setup & Troubleshoot Modal */}
      <FirebaseSetupModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
        initialTab={firebaseModalTab}
      />
    </div>
  );
};
