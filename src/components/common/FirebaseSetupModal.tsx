import React, { useState } from 'react';
import {
  Database,
  X,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Activity,
  ArrowRight,
  RefreshCw,
  Download,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  firebaseConfig,
  RECOMMENDED_FIRESTORE_RULES,
  testFirestoreConnection,
  FirebaseDiagnostic,
} from '../../firebase';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'auth' | 'studentid' | 'troubleshoot';
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'auth',
}) => {
  const {
    firebaseUser,
    cloudSyncStatus,
    cloudError,
    clearCloudError,
    signInWithGoogle,
    signInAsGuest,
    signInWithEmail,
    signUpWithEmail,
    firebaseSignOut,
    syncToFirestoreNow,
    loadFromFirestoreNow,
    student,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'auth' | 'studentid' | 'troubleshoot'>(initialTab);

  // Email form state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [localAuthError, setLocalAuthError] = useState<string | null>(null);

  // Student ID sync state
  const [customStudentId, setCustomStudentId] = useState(student?.studentId || '');
  const [syncActionSubmitting, setSyncActionSubmitting] = useState(false);
  const [syncActionMessage, setSyncActionMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Diagnostic state
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<FirebaseDiagnostic | null>(null);
  const [hasCopiedRules, setHasCopiedRules] = useState(false);

  if (!isOpen) return null;

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLocalAuthError('Please enter both email and password.');
      return;
    }
    setLocalAuthError(null);
    setAuthSubmitting(true);
    clearCloudError();

    const result =
      authMode === 'signin'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);

    setAuthSubmitting(false);
    if (result.success) {
      onClose();
    } else {
      setLocalAuthError(result.error || 'Authentication failed.');
    }
  };

  const handleRunDiagnostic = async () => {
    setIsDiagnosing(true);
    const result = await testFirestoreConnection();
    setDiagnosticResult(result);
    setIsDiagnosing(false);
  };

  const handlePushWithId = async () => {
    if (!customStudentId.trim()) {
      setSyncActionMessage({ text: 'Please enter a Student ID.', success: false });
      return;
    }
    setSyncActionSubmitting(true);
    setSyncActionMessage(null);
    const ok = await syncToFirestoreNow(customStudentId.trim());
    setSyncActionSubmitting(false);
    if (ok) {
      setSyncActionMessage({
        text: `Student records uploaded under ID "${customStudentId.trim()}"!`,
        success: true,
      });
    } else {
      setSyncActionMessage({
        text: 'Sync failed. Check Firestore rules in the Troubleshoot tab.',
        success: false,
      });
    }
  };

  const handlePullWithId = async () => {
    if (!customStudentId.trim()) {
      setSyncActionMessage({ text: 'Please enter a Student ID.', success: false });
      return;
    }
    setSyncActionSubmitting(true);
    setSyncActionMessage(null);
    const ok = await loadFromFirestoreNow(customStudentId.trim());
    setSyncActionSubmitting(false);
    if (ok) {
      setSyncActionMessage({
        text: `Successfully retrieved records for "${customStudentId.trim()}"!`,
        success: true,
      });
      setTimeout(() => onClose(), 1500);
    } else {
      setSyncActionMessage({
        text: `No records found or permission denied for "${customStudentId.trim()}".`,
        success: false,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 border border-[#A5E6E2] shadow-2xl space-y-4 my-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0FAF9] border border-[#77DAD7]/60 flex items-center justify-center text-[#0B757B]">
              <Database className="w-5 h-5 text-[#0A858C]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Firebase & Firestore Integration</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Project: <span className="text-[#0B757B] font-semibold">{firebaseConfig.projectId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Cloud Error / Banner if any */}
        {(cloudError || localAuthError) && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{localAuthError || cloudError}</p>
              {(cloudError?.includes('rules') || cloudError?.includes('Permission denied')) && (
                <button
                  onClick={() => setActiveTab('troubleshoot')}
                  className="mt-1 text-[11px] font-bold text-[#0B757B] underline cursor-pointer"
                >
                  View 1-Click Fix in Troubleshoot Tab →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'auth' ? 'bg-white text-[#0B757B] shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Student Account
          </button>
          <button
            onClick={() => setActiveTab('studentid')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'studentid' ? 'bg-white text-[#0B757B] shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Direct Student ID Sync
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'troubleshoot' ? 'bg-white text-[#0B757B] shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <span>Fix & Rules</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </button>
        </div>

        {/* TAB 1: Student Account (Email & Password + Google/Guest) */}
        {activeTab === 'auth' && (
          <div className="space-y-4 pt-1">
            {firebaseUser ? (
              <div className="p-4 rounded-xl bg-[#F0FAF9] border border-[#77DAD7]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#0A858C]">Signed In Account</span>
                    <p className="text-sm font-bold text-slate-800">{firebaseUser.email || 'Guest Student'}</p>
                    <p className="text-[11px] text-slate-400 font-mono">UID: {firebaseUser.uid}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Authenticated
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-[#A5E6E2]/40">
                  <button
                    onClick={async () => {
                      await syncToFirestoreNow();
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#0B757B] text-white text-xs font-bold hover:bg-[#0A858C] transition-colors cursor-pointer text-center"
                  >
                    Sync Records Now
                  </button>
                  <button
                    onClick={firebaseSignOut}
                    className="py-2 px-3 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Email / Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {authMode === 'signin' ? 'Sign In with Email' : 'Register New Account'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                        setLocalAuthError(null);
                      }}
                      className="text-xs text-[#0B757B] font-semibold hover:underline cursor-pointer"
                    >
                      {authMode === 'signin' ? 'Need an account? Sign Up' : 'Already registered? Sign In'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@college.edu"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B757B]"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (min 6 characters)"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B757B]"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full py-2.5 px-4 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                    <span>{authMode === 'signin' ? 'Sign In & Connect' : 'Create Student Account'}</span>
                  </button>
                </form>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase">or</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Google and Guest options */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await signInWithGoogle();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await signInAsGuest();
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Guest Session</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: Direct Student ID Sync */}
        {activeTab === 'studentid' && (
          <div className="space-y-3.5 pt-1">
            <div className="p-3 bg-[#F0FAF9] rounded-xl border border-[#77DAD7]/40 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-[#0B757B]">Fast No-Auth Sync:</span> You can store and retrieve student records directly using your Student ID or Roll Number, without needing email logins or popups.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Student ID / Roll Number</label>
              <input
                type="text"
                value={customStudentId}
                onChange={(e) => setCustomStudentId(e.target.value)}
                placeholder="e.g. 21BCE1042 or STU-8841"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B757B]"
              />
            </div>

            {syncActionMessage && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                  syncActionMessage.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {syncActionMessage.success ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{syncActionMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handlePushWithId}
                disabled={syncActionSubmitting}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncActionSubmitting ? 'animate-spin' : ''}`} />
                <span>Upload Records</span>
              </button>

              <button
                type="button"
                onClick={handlePullWithId}
                disabled={syncActionSubmitting}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Fetch Records</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Troubleshoot & 1-Click Firestore Rules */}
        {activeTab === 'troubleshoot' && (
          <div className="space-y-4 pt-1 text-xs">
            {/* Step 1: Real-time diagnostic */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#0B757B]" />
                  Firestore Connection Diagnostic
                </span>
                <button
                  type="button"
                  onClick={handleRunDiagnostic}
                  disabled={isDiagnosing}
                  className="px-2.5 py-1 rounded-lg bg-[#0B757B] text-white font-bold text-[11px] hover:bg-[#0A858C] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isDiagnosing ? 'animate-spin' : ''}`} />
                  <span>Run Test</span>
                </button>
              </div>

              {diagnosticResult ? (
                <div
                  className={`p-2.5 rounded-lg border text-[11px] ${
                    diagnosticResult.connected
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <p className="font-bold">{diagnosticResult.message}</p>
                  <p className="text-[10px] mt-0.5 opacity-90">{diagnosticResult.details}</p>
                  {diagnosticResult.suggestedFix && (
                    <p className="font-semibold text-[11px] mt-1 text-[#0B757B]">
                      Fix: {diagnosticResult.suggestedFix}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Click &quot;Run Test&quot; to verify read and write access to your Firebase project.
                </p>
              )}
            </div>

            {/* Step 2: The exact fix instructions */}
            <div className="p-3.5 rounded-xl bg-white border border-[#A5E6E2]/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Why was permission denied?</h4>
                  <p className="text-[11px] text-slate-500">
                    New Firebase projects have rules set to <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono">allow read, write: if false;</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyRules}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B757B] text-white font-bold text-xs hover:bg-[#0A858C] transition-colors cursor-pointer shadow-xs"
                >
                  {hasCopiedRules ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Rules</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-600">
                <p className="font-bold text-slate-700">2-Minute Fix in Firebase Console:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    Open{' '}
                    <a
                      href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0B757B] font-bold underline inline-flex items-center gap-0.5"
                    >
                      Firestore Database &gt; Rules
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </li>
                  <li>Click <strong>Copy Rules</strong> above, paste into the editor, and click <strong>Publish</strong>.</li>
                  <li>
                    Open{' '}
                    <a
                      href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0B757B] font-bold underline inline-flex items-center gap-0.5"
                    >
                      Authentication &gt; Sign-in method
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>{' '}
                    and click <strong>Get started</strong>, then enable <strong>Email/Password</strong> or <strong>Anonymous</strong>.
                  </li>
                </ol>
              </div>

              {/* Collapsible Rules Preview */}
              <div className="bg-slate-900 rounded-lg p-2.5 text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-36">
                <pre>{RECOMMENDED_FIRESTORE_RULES}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                cloudSyncStatus === 'synced'
                  ? 'bg-emerald-500'
                  : cloudSyncStatus === 'error'
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
            />
            <span className="capitalize">{cloudSyncStatus} mode</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
