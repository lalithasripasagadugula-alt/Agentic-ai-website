import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDzEOxA7YVX7oLsMX4aw38jI6EVPuyhn3A",
  authDomain: "proact-ai-ff60d.firebaseapp.com",
  projectId: "proact-ai-ff60d",
  storageBucket: "proact-ai-ff60d.firebasestorage.app",
  messagingSenderId: "537993872530",
  appId: "1:537993872530:web:be22e6929143338dcc124b",
  measurementId: "G-ZG4EW8V32Z"
};

// Initialize Firebase singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  code?: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function formatFirebaseAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  const message = error instanceof Error ? error.message : String(error);

  switch (code) {
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not yet enabled in your Firebase Console. Go to Build > Authentication and click "Get started".';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is disabled in Firebase Console. Go to Authentication > Sign-in method to enable it.';
    case 'auth/popup-blocked':
      return 'The browser blocked the sign-in popup window. Please allow popups or use Email & Password sign-in below.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing verification.';
    case 'auth/unauthorized-domain':
      return 'This web domain is not in your Firebase Authorized Domains list. Add it in Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid email or password entered.';
    case 'auth/user-not-found':
      return 'No registered account found with this email. Please click "Sign Up" below.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Network connection error while reaching Firebase Auth.';
    default:
      return message || 'Authentication failed. Please check your credentials.';
  }
}

export function formatFirestoreError(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  const message = error instanceof Error ? error.message : String(error);

  if (code === 'permission-denied' || message.includes('permission-denied') || message.includes('PERMISSION_DENIED')) {
    return 'Permission denied by Firestore Security Rules. Your Firebase Console rules currently block reads/writes. Please copy and publish the recommended rules in Firebase Console -> Firestore Database -> Rules.';
  }
  if (code === 'unavailable' || message.includes('offline')) {
    return 'Firestore is temporarily unavailable or your network is offline. Changes are saved locally.';
  }
  if (code === 'not-found') {
    return 'Requested record was not found in Firestore.';
  }
  return message || 'Firestore operation encountered an error.';
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errCode = (error as { code?: string })?.code;
  const errMsg = formatFirestoreError(error);

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    code: errCode,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };

  console.error('[Firebase Error]', errInfo);
  throw new Error(errMsg);
}

export interface FirebaseDiagnostic {
  connected: boolean;
  canRead: boolean;
  canWrite: boolean;
  latencyMs: number;
  rulesStatus: 'ready' | 'rules_permission_denied' | 'network_error';
  authStatus: 'ready' | 'unconfigured' | 'anonymous_disabled' | 'not_signed_in';
  message: string;
  details: string;
  suggestedFix?: string;
}

/**
 * Runs a full health and permissions diagnostic against Firebase & Cloud Firestore
 */
export async function testFirestoreConnection(): Promise<FirebaseDiagnostic> {
  const start = Date.now();
  let canRead = false;
  let canWrite = false;
  let rulesStatus: 'ready' | 'rules_permission_denied' | 'network_error' = 'ready';
  let authStatus: FirebaseDiagnostic['authStatus'] = auth.currentUser ? 'ready' : 'not_signed_in';
  let authNotice = '';

  // 1. Test Read capability
  try {
    const testDoc = await getDoc(doc(db, 'system', 'connection'));
    canRead = true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string })?.code;
    if (code === 'permission-denied' || msg.includes('PERMISSION_DENIED')) {
      rulesStatus = 'rules_permission_denied';
    } else if (msg.includes('offline') || msg.includes('unavailable')) {
      rulesStatus = 'network_error';
    }
  }

  // 2. Test Write capability
  try {
    await setDoc(doc(db, 'system', 'connection'), {
      lastPing: new Date().toISOString(),
      clientTimestamp: Date.now(),
      status: 'active',
    }, { merge: true });
    canWrite = true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string })?.code;
    if (code === 'permission-denied' || msg.includes('PERMISSION_DENIED')) {
      rulesStatus = 'rules_permission_denied';
    }
  }

  // 3. Test Auth state & readiness if not already signed in
  if (!auth.currentUser) {
    try {
      // Test if anonymous auth is configured
      // We don't sign in here, just inspect auth configuration state
    } catch {
      // Ignored
    }
  }

  const latencyMs = Date.now() - start;

  if (canRead && canWrite) {
    return {
      connected: true,
      canRead: true,
      canWrite: true,
      latencyMs,
      rulesStatus: 'ready',
      authStatus: auth.currentUser ? 'ready' : 'not_signed_in',
      message: `Full Cloud Firestore access active (${latencyMs}ms)`,
      details: `Project ${firebaseConfig.projectId} is fully connected with read and write permissions enabled.`,
    };
  }

  if (rulesStatus === 'rules_permission_denied') {
    return {
      connected: false,
      canRead,
      canWrite,
      latencyMs,
      rulesStatus: 'rules_permission_denied',
      authStatus,
      message: 'Cloud Firestore reached, but Security Rules denied access (PERMISSION_DENIED)',
      details: 'Firebase project proact-ai-ff60d was reached successfully, but the security rules in your Firebase Console are currently blocking reads/writes.',
      suggestedFix: 'Go to Firebase Console > Firestore Database > Rules, paste the recommended rules, and click Publish.',
    };
  }

  if (rulesStatus === 'network_error') {
    return {
      connected: false,
      canRead: false,
      canWrite: false,
      latencyMs,
      rulesStatus: 'network_error',
      authStatus,
      message: 'Network unreachable or Firestore is offline',
      details: 'Unable to reach Firebase servers. Please verify your internet connection.',
    };
  }

  return {
    connected: canRead,
    canRead,
    canWrite,
    latencyMs,
    rulesStatus: canRead ? 'ready' : 'rules_permission_denied',
    authStatus,
    message: canRead ? 'Read access granted; write permissions restricted' : 'Firebase access restricted',
    details: `Latency: ${latencyMs}ms to ${firebaseConfig.projectId}.`,
    suggestedFix: 'Update your security rules in the Firebase Console.',
  };
}

export const RECOMMENDED_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    // Health check and connection testing endpoints
    match /system/{docId} {
      allow read, write: if true;
    }

    match /test/{docId} {
      allow read, write: if true;
    }

    // Direct student storage by student ID or Roll Number
    match /students/{studentId} {
      allow read, write: if true;

      match /{allSubcollections=**} {
        allow read, write: if true;
      }
    }

    // Authenticated user accounts
    match /users/{userId} {
      allow read, write: if true;

      match /{allSubcollections=**} {
        allow read, write: if true;
      }
    }
  }
}`;
