import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  testFirestoreConnection,
  type FirebaseDiagnostic,
  formatFirebaseAuthError,
  formatFirestoreError,
} from '../firebase';
import {
  saveStudentProfileToFirestore,
  saveSubjectsToFirestore,
  saveAttendanceRecordsToFirestore,
  saveTodosToFirestore,
  saveRisksToFirestore,
  saveScheduleToFirestore,
  fetchAllStudentDataFromFirestore,
  syncAllStudentDataToFirestore,
} from '../services/firebaseService';
import {
  NavigationTab,
  StudentProfile,
  Subject,
  DailyAttendanceRecord,
  AcademicRisk,
  ScheduledTask,
  TodoTask,
  ChatMessage,
  AttendanceStatus,
} from '../types';
import {
  analyzeAcademicRisks,
  generateDeterministicSchedule,
  calculateAttendancePercentage,
} from '../utils/academicCalculations';

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface AppContextType {
  // Navigation & Local State
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  student: StudentProfile | null;
  isProfileComplete: boolean;
  saveProfile: (profile: StudentProfile) => void;
  logout: () => void;
  resetAllData: () => void;
  loadSampleTemplate: () => void;

  // Firebase Authentication & Cloud State
  firebaseUser: User | null;
  isAuthLoading: boolean;
  cloudSyncStatus: CloudSyncStatus;
  lastCloudSync: string | null;
  cloudError: string | null;
  clearCloudError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  firebaseSignOut: () => Promise<void>;
  syncToFirestoreNow: (targetId?: string) => Promise<boolean>;
  loadFromFirestoreNow: (targetId?: string) => Promise<boolean>;
  testCloudConnection: () => Promise<FirebaseDiagnostic>;

  // Subjects
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updated: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Attendance Records
  attendanceRecords: DailyAttendanceRecord[];
  recordAttendance: (date: string, subjectId: string, status: AttendanceStatus, notes?: string) => void;
  deleteAttendanceRecord: (recordId: string) => void;

  // To-Do Tasks
  todos: TodoTask[];
  addTodo: (todo: Omit<TodoTask, 'id' | 'createdAt'>) => void;
  updateTodo: (id: string, updated: Partial<TodoTask>) => void;
  toggleTodoComplete: (id: string) => void;
  deleteTodo: (id: string) => void;

  // Academic Risks
  risks: AcademicRisk[];
  updateRiskStatus: (id: string, status: 'Open' | 'In Progress' | 'Resolved') => void;
  refreshRisks: () => void;

  // Recovery Schedule
  schedule: ScheduledTask[];
  generateSchedule: () => void;
  toggleScheduleTaskComplete: (id: string) => void;
  deleteScheduleTask: (id: string) => void;

  // AI Mentor
  mentorMessages: ChatMessage[];
  isMentorTyping: boolean;
  sendMentorQuery: (query: string) => Promise<void>;
  clearMentorChat: () => void;
  isAssistantDrawerOpen: boolean;
  setIsAssistantDrawerOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'proact_student_agent_v2';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from browser storage
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved state:', e);
    }
    return null;
  };

  const initial = loadSavedState();

  const [student, setStudent] = useState<StudentProfile | null>(initial?.student || null);
  const [activeTab, setActiveTab] = useState<NavigationTab>(
    initial?.student?.isProfileComplete ? 'dashboard' : 'home'
  );

  const [subjects, setSubjects] = useState<Subject[]>(initial?.subjects || []);
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>(
    initial?.attendanceRecords || []
  );
  const [todos, setTodos] = useState<TodoTask[]>(initial?.todos || []);
  const [risks, setRisks] = useState<AcademicRisk[]>(initial?.risks || []);
  const [schedule, setSchedule] = useState<ScheduledTask[]>(initial?.schedule || []);

  const [mentorMessages, setMentorMessages] = useState<ChatMessage[]>(
    initial?.mentorMessages || [
      {
        id: 'welcome-mentor',
        sender: 'assistant',
        text: 'Hello! I am ProAct AI Mentor, your personal academic success companion. Once you enter your subjects, attendance, and coursework, I can explain your academic risks, calculate attendance targets, and help you structure your revision.',
        timestamp: 'Just now',
      },
    ]
  );
  const [isMentorTyping, setIsMentorTyping] = useState<boolean>(false);
  const [isAssistantDrawerOpen, setIsAssistantDrawerOpen] = useState<boolean>(false);

  // Firebase auth & cloud sync states
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('idle');
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);

  const isProfileComplete = Boolean(student?.isProfileComplete);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsAuthLoading(false);

      if (user) {
        // Automatically fetch student data from Cloud Firestore
        try {
          setCloudSyncStatus('syncing');
          const cloudData = await fetchAllStudentDataFromFirestore(user.uid);

          if (cloudData.profile) {
            // User has existing records in Firestore - load them
            setStudent(cloudData.profile);
            if (cloudData.subjects.length > 0) setSubjects(cloudData.subjects);
            if (cloudData.attendanceRecords.length > 0) setAttendanceRecords(cloudData.attendanceRecords);
            if (cloudData.todos.length > 0) setTodos(cloudData.todos);
            if (cloudData.risks.length > 0) setRisks(cloudData.risks);
            if (cloudData.schedule.length > 0) setSchedule(cloudData.schedule);

            setLastCloudSync(new Date().toLocaleTimeString());
            setCloudSyncStatus('synced');
            setCloudError(null);
          } else if (student?.isProfileComplete) {
            // User logged in with local profile, back it up to Firestore
            await syncAllStudentDataToFirestore(user.uid, {
              profile: student,
              subjects,
              attendanceRecords,
              todos,
              risks,
              schedule,
            });
            setLastCloudSync(new Date().toLocaleTimeString());
            setCloudSyncStatus('synced');
            setCloudError(null);
          } else {
            setCloudSyncStatus('synced');
          }
        } catch (err: unknown) {
          console.error('Failed to load initial data from Firestore:', err);
          setCloudSyncStatus('error');
          setCloudError(err instanceof Error ? err.message : 'Firestore sync error');
        }
      } else {
        setCloudSyncStatus('idle');
      }
    });

    return () => unsubscribe();
  }, []);

  // Recalculate risks when subjects, todos, or target percentage change
  useEffect(() => {
    if (student?.isProfileComplete) {
      const detected = analyzeAcademicRisks({
        subjects,
        todos,
        profile: student,
      });

      // Preserve existing resolved statuses
      setRisks((prevRisks) => {
        const statusMap = new Map(prevRisks.map((r) => [r.id, r.status]));
        return detected.map((r) => ({
          ...r,
          status: statusMap.get(r.id) || r.status,
        }));
      });
    }
  }, [subjects, todos, student?.attendanceTargetPercent, student?.isProfileComplete]);

  // Persist to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        student,
        subjects,
        attendanceRecords,
        todos,
        risks,
        schedule,
        mentorMessages,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }, [student, subjects, attendanceRecords, todos, risks, schedule, mentorMessages]);

  // Debounced auto-save to Firestore when authenticated or profile exists
  useEffect(() => {
    const syncTarget = firebaseUser?.uid || (student?.isProfileComplete ? student.studentId : null);
    if (!syncTarget || !student?.isProfileComplete) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setCloudSyncStatus('syncing');
        await syncAllStudentDataToFirestore(syncTarget, {
          profile: student,
          subjects,
          attendanceRecords,
          todos,
          risks,
          schedule,
        });
        setCloudSyncStatus('synced');
        setLastCloudSync(new Date().toLocaleTimeString());
        setCloudError(null);
      } catch (err: unknown) {
        const msg = formatFirestoreError(err);
        console.warn('Auto-save to Firestore notice:', msg);
        setCloudSyncStatus('error');
        setCloudError(msg);
      }
    }, 2500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [student, subjects, attendanceRecords, todos, risks, schedule, firebaseUser]);

  const clearCloudError = () => {
    setCloudError(null);
  };

  // Manual cloud actions
  const syncToFirestoreNow = async (targetId?: string): Promise<boolean> => {
    const syncId =
      targetId?.trim() ||
      firebaseUser?.uid ||
      student?.studentId?.trim() ||
      (student?.email ? encodeURIComponent(student.email) : null);

    if (!syncId) {
      setCloudError('Please create a student profile or sign in to push records to Cloud Firestore.');
      return false;
    }
    if (!student?.isProfileComplete) {
      setCloudError('Please complete your student profile details first before pushing to Cloud Firestore.');
      return false;
    }

    try {
      setCloudSyncStatus('syncing');
      setCloudError(null);
      await syncAllStudentDataToFirestore(syncId, {
        profile: student,
        subjects,
        attendanceRecords,
        todos,
        risks,
        schedule,
      });
      setCloudSyncStatus('synced');
      setLastCloudSync(new Date().toLocaleTimeString());
      return true;
    } catch (err: unknown) {
      const msg = formatFirestoreError(err);
      console.error('Manual Firestore sync failed:', err);
      setCloudSyncStatus('error');
      setCloudError(msg);
      return false;
    }
  };

  const loadFromFirestoreNow = async (targetId?: string): Promise<boolean> => {
    const syncId =
      targetId?.trim() ||
      firebaseUser?.uid ||
      student?.studentId?.trim() ||
      (student?.email ? encodeURIComponent(student.email) : null);

    if (!syncId) {
      setCloudError('Please provide a Student ID / Roll Number or sign in to load records from Firestore.');
      return false;
    }

    try {
      setCloudSyncStatus('syncing');
      setCloudError(null);
      const cloudData = await fetchAllStudentDataFromFirestore(syncId);
      if (cloudData.profile) {
        setStudent(cloudData.profile);
        if (cloudData.subjects) setSubjects(cloudData.subjects);
        if (cloudData.attendanceRecords) setAttendanceRecords(cloudData.attendanceRecords);
        if (cloudData.todos) setTodos(cloudData.todos);
        if (cloudData.risks) setRisks(cloudData.risks);
        if (cloudData.schedule) setSchedule(cloudData.schedule);
        setLastCloudSync(new Date().toLocaleTimeString());
        setCloudSyncStatus('synced');
        return true;
      }
      setCloudSyncStatus('synced');
      setCloudError(`No student records found in Firestore for identifier "${syncId}".`);
      return false;
    } catch (err: unknown) {
      const msg = formatFirestoreError(err);
      console.error('Failed to load from Firestore:', err);
      setCloudSyncStatus('error');
      setCloudError(msg);
      return false;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setCloudSyncStatus('syncing');
      setCloudError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = formatFirebaseAuthError(err);
      console.error('Google Sign-In failed:', err);
      setCloudError(msg);
      setCloudSyncStatus('error');
    }
  };

  const signInAsGuest = async () => {
    try {
      setCloudSyncStatus('syncing');
      setCloudError(null);
      await signInAnonymously(auth);
    } catch (err: unknown) {
      const msg = formatFirebaseAuthError(err);
      console.error('Guest Auth failed:', err);
      setCloudError(msg);
      setCloudSyncStatus('error');
    }
  };

  const signInWithEmail = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setCloudSyncStatus('syncing');
      setCloudError(null);
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      setCloudSyncStatus('synced');
      return { success: true };
    } catch (err: unknown) {
      const msg = formatFirebaseAuthError(err);
      console.error('Email Sign-In failed:', err);
      setCloudError(msg);
      setCloudSyncStatus('error');
      return { success: false, error: msg };
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setCloudSyncStatus('syncing');
      setCloudError(null);
      await createUserWithEmailAndPassword(auth, email.trim(), pass);
      setCloudSyncStatus('synced');
      return { success: true };
    } catch (err: unknown) {
      const msg = formatFirebaseAuthError(err);
      console.error('Email Sign-Up failed:', err);
      setCloudError(msg);
      setCloudSyncStatus('error');
      return { success: false, error: msg };
    }
  };

  const firebaseSignOut = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setCloudSyncStatus('idle');
      setLastCloudSync(null);
      setCloudError(null);
    } catch (err: unknown) {
      console.error('Sign out failed:', err);
    }
  };

  const testCloudConnection = async () => {
    return await testFirestoreConnection();
  };

  // Profile actions
  const saveProfile = async (newProfile: StudentProfile) => {
    const completeProfile: StudentProfile = {
      ...newProfile,
      isProfileComplete: true,
    };
    setStudent(completeProfile);
    setActiveTab('dashboard');

    const syncTarget = firebaseUser?.uid || completeProfile.studentId;
    if (syncTarget) {
      try {
        setCloudSyncStatus('syncing');
        await saveStudentProfileToFirestore(syncTarget, completeProfile);
        setCloudSyncStatus('synced');
        setLastCloudSync(new Date().toLocaleTimeString());
        setCloudError(null);
      } catch (e: unknown) {
        const msg = formatFirestoreError(e);
        console.warn('Failed to save profile to Firestore:', msg);
        setCloudError(msg);
      }
    }
  };

  const logout = () => {
    setStudent(null);
    setActiveTab('home');
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStudent(null);
    setSubjects([]);
    setAttendanceRecords([]);
    setTodos([]);
    setRisks([]);
    setSchedule([]);
    setMentorMessages([
      {
        id: 'welcome-mentor',
        sender: 'assistant',
        text: 'Hello! I am ProAct AI Mentor. Add your subjects and attendance to get started.',
        timestamp: 'Just now',
      },
    ]);
    setActiveTab('home');
  };

  const loadSampleTemplate = () => {
    const sampleProfile: StudentProfile = {
      fullName: 'Aarav Sharma',
      email: firebaseUser?.email || 'aarav.sharma@campus.edu',
      collegeName: 'National Institute of Technology',
      branch: 'Computer Science & Engineering',
      academicYear: '3rd Year',
      semester: 'Semester VI',
      studentId: '22CS104',
      dailyStudyHours: 3.5,
      preferredStudyTime: 'Evening',
      academicGoals: 'Maintain CGPA above 8.5 and clear attendance threshold in Data Communications.',
      existingDifficulties: 'Networking routing algorithms and overlapping lab assignment deadlines.',
      attendanceTargetPercent: 75,
      isProfileComplete: true,
    };

    const sampleSubjects: Subject[] = [
      {
        id: 'subj-1',
        name: 'Design & Analysis of Algorithms',
        code: 'CS301',
        faculty: 'Prof. Radhika Menon',
        totalClasses: 38,
        attendedClasses: 32,
        targetAttendance: 75,
        internalMarksObtained: 24,
        maxInternalMarks: 30,
        upcomingAssessments: 'Midterm 2 on Nov 12',
        assignmentDeadlines: 'DP Assignment 4 due Oct 15',
        difficulty: 'Medium',
      },
      {
        id: 'subj-2',
        name: 'Data Communications & Networks',
        code: 'CS304',
        faculty: 'Dr. Suresh Varma',
        totalClasses: 35,
        attendedClasses: 25, // 71.4% -> Triggers attendance risk
        targetAttendance: 75,
        internalMarksObtained: 15,
        maxInternalMarks: 30, // 50% -> Triggers internal marks risk
        upcomingAssessments: 'Quiz 2 on Oct 18',
        assignmentDeadlines: 'Packet Tracer Lab on Oct 16',
        difficulty: 'Hard',
      },
      {
        id: 'subj-3',
        name: 'Machine Learning & Neural Networks',
        code: 'CS308',
        faculty: 'Dr. Ananya Iyer',
        totalClasses: 36,
        attendedClasses: 30,
        targetAttendance: 75,
        internalMarksObtained: 27,
        maxInternalMarks: 30,
        upcomingAssessments: 'Project Presentation on Oct 25',
        assignmentDeadlines: 'ResNet Classifier Milestone due Oct 20',
        difficulty: 'Medium',
      },
      {
        id: 'subj-4',
        name: 'Distributed Systems & Cloud Computing',
        code: 'CS312',
        faculty: 'Prof. K. Narayanan',
        totalClasses: 38,
        attendedClasses: 29, // 76.3% -> Safe but tight
        targetAttendance: 75,
        internalMarksObtained: 22,
        maxInternalMarks: 30,
        upcomingAssessments: 'Midterm 2 on Oct 22',
        assignmentDeadlines: 'Raft Consensus Report due Oct 14',
        difficulty: 'Hard',
      },
    ];

    const todayStr = new Date().toISOString().split('T')[0];

    const sampleTodos: TodoTask[] = [
      {
        id: 'todo-1',
        title: 'Complete Algorithms Assignment 4 (Dynamic Programming)',
        subjectId: 'subj-1',
        subjectName: 'Algorithms (CS301)',
        deadline: todayStr,
        priority: 'Urgent',
        notes: 'Matrix chain multiplication and optimal BST problems.',
        completed: false,
        createdAt: todayStr,
      },
      {
        id: 'todo-2',
        title: 'Review Data Communications Chapter 4 (BGP & OSPF Routing)',
        subjectId: 'subj-2',
        subjectName: 'Data Communications (CS304)',
        deadline: todayStr,
        priority: 'High',
        notes: 'Prepare for Quiz 2 to improve internal marks.',
        completed: false,
        createdAt: todayStr,
      },
      {
        id: 'todo-3',
        title: 'Submit Distributed Systems Raft Protocol Implementation',
        subjectId: 'subj-4',
        subjectName: 'Distributed Systems (CS312)',
        deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        priority: 'Medium',
        notes: 'Leader election proofs and log replication tests.',
        completed: false,
        createdAt: todayStr,
      },
    ];

    setStudent(sampleProfile);
    setSubjects(sampleSubjects);
    setTodos(sampleTodos);

    const generatedRisks = analyzeAcademicRisks({
      subjects: sampleSubjects,
      todos: sampleTodos,
      profile: sampleProfile,
    });
    setRisks(generatedRisks);

    const generatedSched = generateDeterministicSchedule({
      subjects: sampleSubjects,
      risks: generatedRisks,
      todos: sampleTodos,
      profile: sampleProfile,
    });
    setSchedule(generatedSched);

    setActiveTab('dashboard');

    // Also sync to Firestore if signed in
    if (firebaseUser) {
      syncAllStudentDataToFirestore(firebaseUser.uid, {
        profile: sampleProfile,
        subjects: sampleSubjects,
        attendanceRecords: [],
        todos: sampleTodos,
        risks: generatedRisks,
        schedule: generatedSched,
      }).catch(console.error);
    }
  };

  // Subject actions
  const addSubject = (newSub: Omit<Subject, 'id'>) => {
    const subject: Subject = {
      ...newSub,
      id: `subj-${Date.now()}`,
    };
    const updated = [...subjects, subject];
    setSubjects(updated);
    if (firebaseUser) {
      saveSubjectsToFirestore(firebaseUser.uid, updated).catch(console.error);
    }
  };

  const updateSubject = (id: string, updated: Partial<Subject>) => {
    const updatedList = subjects.map((s) => (s.id === id ? { ...s, ...updated } : s));
    setSubjects(updatedList);
    if (firebaseUser) {
      saveSubjectsToFirestore(firebaseUser.uid, updatedList).catch(console.error);
    }
  };

  const deleteSubject = (id: string) => {
    const updatedList = subjects.filter((s) => s.id !== id);
    const updatedAttendance = attendanceRecords.filter((r) => r.subjectId !== id);
    setSubjects(updatedList);
    setAttendanceRecords(updatedAttendance);
    if (firebaseUser) {
      saveSubjectsToFirestore(firebaseUser.uid, updatedList).catch(console.error);
      saveAttendanceRecordsToFirestore(firebaseUser.uid, updatedAttendance).catch(console.error);
    }
  };

  // Attendance actions
  const recordAttendance = (
    date: string,
    subjectId: string,
    status: AttendanceStatus,
    notes?: string
  ) => {
    const targetSub = subjects.find((s) => s.id === subjectId);
    if (!targetSub) return;

    const existingIndex = attendanceRecords.findIndex(
      (r) => r.date === date && r.subjectId === subjectId
    );

    let updatedRecords = [...attendanceRecords];

    if (existingIndex >= 0) {
      const oldStatus = updatedRecords[existingIndex].status;
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        status,
        notes,
      };

      let newAttended = targetSub.attendedClasses;
      let newTotal = targetSub.totalClasses;

      if (oldStatus !== status) {
        if (oldStatus === 'present' && status === 'absent') {
          newAttended = Math.max(0, newAttended - 1);
        } else if (oldStatus === 'absent' && status === 'present') {
          newAttended += 1;
        } else if (oldStatus === 'excused' && status === 'present') {
          newAttended += 1;
          newTotal += 1;
        } else if (oldStatus === 'excused' && status === 'absent') {
          newTotal += 1;
        } else if (status === 'excused') {
          if (oldStatus === 'present') newAttended = Math.max(0, newAttended - 1);
          newTotal = Math.max(0, newTotal - 1);
        }
        updateSubject(subjectId, { attendedClasses: newAttended, totalClasses: newTotal });
      }
    } else {
      const newRec: DailyAttendanceRecord = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date,
        subjectId,
        subjectCode: targetSub.code,
        subjectName: targetSub.name,
        status,
        notes,
      };
      updatedRecords.push(newRec);

      let newAttended = targetSub.attendedClasses;
      let newTotal = targetSub.totalClasses;

      if (status === 'present') {
        newAttended += 1;
        newTotal += 1;
      } else if (status === 'absent') {
        newTotal += 1;
      }

      updateSubject(subjectId, { attendedClasses: newAttended, totalClasses: newTotal });
    }

    setAttendanceRecords(updatedRecords);
    if (firebaseUser) {
      saveAttendanceRecordsToFirestore(firebaseUser.uid, updatedRecords).catch(console.error);
    }
  };

  const deleteAttendanceRecord = (recordId: string) => {
    const record = attendanceRecords.find((r) => r.id === recordId);
    if (!record) return;

    const targetSub = subjects.find((s) => s.id === record.subjectId);
    if (targetSub) {
      let newAttended = targetSub.attendedClasses;
      let newTotal = targetSub.totalClasses;

      if (record.status === 'present') {
        newAttended = Math.max(0, newAttended - 1);
        newTotal = Math.max(0, newTotal - 1);
      } else if (record.status === 'absent') {
        newTotal = Math.max(0, newTotal - 1);
      }
      updateSubject(targetSub.id, { attendedClasses: newAttended, totalClasses: newTotal });
    }

    const updated = attendanceRecords.filter((r) => r.id !== recordId);
    setAttendanceRecords(updated);
    if (firebaseUser) {
      saveAttendanceRecordsToFirestore(firebaseUser.uid, updated).catch(console.error);
    }
  };

  // To-Do actions
  const addTodo = (newTodo: Omit<TodoTask, 'id' | 'createdAt'>) => {
    const todo: TodoTask = {
      ...newTodo,
      id: `todo-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [todo, ...todos];
    setTodos(updated);
    if (firebaseUser) {
      saveTodosToFirestore(firebaseUser.uid, updated).catch(console.error);
    }
  };

  const updateTodo = (id: string, updated: Partial<TodoTask>) => {
    const updatedList = todos.map((t) => (t.id === id ? { ...t, ...updated } : t));
    setTodos(updatedList);
    if (firebaseUser) {
      saveTodosToFirestore(firebaseUser.uid, updatedList).catch(console.error);
    }
  };

  const toggleTodoComplete = (id: string) => {
    const updatedList = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTodos(updatedList);
    if (firebaseUser) {
      saveTodosToFirestore(firebaseUser.uid, updatedList).catch(console.error);
    }
  };

  const deleteTodo = (id: string) => {
    const updatedList = todos.filter((t) => t.id !== id);
    setTodos(updatedList);
    if (firebaseUser) {
      saveTodosToFirestore(firebaseUser.uid, updatedList).catch(console.error);
    }
  };

  // Risks actions
  const updateRiskStatus = (id: string, status: 'Open' | 'In Progress' | 'Resolved') => {
    const updatedList = risks.map((r) => (r.id === id ? { ...r, status } : r));
    setRisks(updatedList);
    if (firebaseUser) {
      saveRisksToFirestore(firebaseUser.uid, updatedList).catch(console.error);
    }
  };

  const refreshRisks = () => {
    if (student) {
      const detected = analyzeAcademicRisks({
        subjects,
        todos,
        profile: student,
      });
      setRisks(detected);
      if (firebaseUser) {
        saveRisksToFirestore(firebaseUser.uid, detected).catch(console.error);
      }
    }
  };

  // Recovery schedule actions
  const generateSchedule = () => {
    const generated = generateDeterministicSchedule({
      subjects,
      risks,
      todos,
      profile: student,
    });
    setSchedule(generated);
    if (firebaseUser) {
      saveScheduleToFirestore(firebaseUser.uid, generated).catch(console.error);
    }
  };

  const toggleScheduleTaskComplete = (id: string) => {
    const updatedList = schedule.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setSchedule(updatedList);
    if (firebaseUser) {
      saveScheduleToFirestore(firebaseUser.uid, updatedList).catch(console.error);
    }
  };

  const deleteScheduleTask = (id: string) => {
    const updatedList = schedule.filter((t) => t.id !== id);
    setSchedule(updatedList);
    if (firebaseUser) {
      saveScheduleToFirestore(firebaseUser.uid, updatedList).catch(console.error);
    }
  };

  // AI Mentor actions
  const sendMentorQuery = async (query: string) => {
    if (!query.trim() || isMentorTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMentorMessages((prev) => [...prev, userMsg]);
    setIsMentorTyping(true);

    try {
      const studentContext = {
        name: student?.fullName || 'Student',
        branch: student?.branch,
        year: student?.academicYear,
        semester: student?.semester,
        targetAttendance: student?.attendanceTargetPercent || 75,
        availableStudyHours: student?.dailyStudyHours || 3,
        subjects: subjects.map((s) => ({
          code: s.code,
          name: s.name,
          attended: s.attendedClasses,
          total: s.totalClasses,
          percentage: calculateAttendancePercentage(s.attendedClasses, s.totalClasses),
          internalMarks: `${s.internalMarksObtained || 0}/${s.maxInternalMarks || 0}`,
          difficulty: s.difficulty,
        })),
        risks: risks.map((r) => ({
          title: r.title,
          severity: r.severity,
          triggerData: r.triggerData,
          status: r.status,
        })),
        pendingTodos: todos.filter((t) => !t.completed).map((t) => ({
          title: t.title,
          deadline: t.deadline,
          priority: t.priority,
        })),
      };

      // 1. First attempt: n8n workflow chat webhook endpoint
      try {
        const n8nRes = await fetch('/api/n8n/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            chatInput: query,
            studentContext,
            sessionId: student?.studentId || 'student-chat',
          }),
        });

        if (n8nRes.ok) {
          const n8nData = await n8nRes.json();
          if (n8nData.reply) {
            const assistantMsg: ChatMessage = {
              id: `n8n-${Date.now()}`,
              sender: 'assistant',
              text: n8nData.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isLiveAI: true,
              source: 'n8n',
            };
            setMentorMessages((prev) => [...prev, assistantMsg]);
            return;
          }
        }
      } catch (n8nErr) {
        console.warn('n8n webhook invocation bypassed, falling back to Gemini/rules:', n8nErr);
      }

      // 2. Secondary attempt: Built-in Gemini model endpoint
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, studentContext }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLiveAI: data.isLiveAI,
          source: 'gemini',
        };
        setMentorMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      // Contextual rule-based fallback
      const qLower = query.toLowerCase();
      let reply = '';
      if (qLower.includes('attendance') || qLower.includes('miss')) {
        const lowAttendanceSubs = subjects.filter(
          (s) => calculateAttendancePercentage(s.attendedClasses, s.totalClasses) < (student?.attendanceTargetPercent || 75)
        );
        if (lowAttendanceSubs.length > 0) {
          const sub = lowAttendanceSubs[0];
          const pct = calculateAttendancePercentage(sub.attendedClasses, sub.totalClasses);
          reply = `According to your saved records, **${sub.name}** is currently at **${pct}%**, which is below your configured target of **${student?.attendanceTargetPercent || 75}%**. We strongly recommend attending upcoming lectures without missing any to restore eligibility.`;
        } else {
          reply = `All your entered subjects are currently meeting or exceeding your attendance target of **${student?.attendanceTargetPercent || 75}%**. Keep maintaining regular class attendance!`;
        }
      } else if (qLower.includes('risk') || qLower.includes('priority')) {
        const openRisks = risks.filter((r) => r.status === 'Open');
        if (openRisks.length > 0) {
          reply = `You currently have **${openRisks.length} open academic risk(s)**. Your top priority should be: **${openRisks[0].title}** (${openRisks[0].triggerData}). Check the **Academic Risks** tab for step-by-step corrective actions.`;
        } else {
          reply = 'No critical academic risks are currently detected in your saved records. Good job staying on top of your coursework!';
        }
      } else {
        reply = `I have reviewed your academic profile for ${student?.branch || 'your degree'}. You have ${subjects.length} subjects registered and ${todos.filter((t) => !t.completed).length} pending tasks. Feel free to ask about specific subjects, attendance targets, or study scheduling.`;
      }

      setMentorMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLiveAI: false,
          source: 'rules',
        },
      ]);
    } finally {
      setIsMentorTyping(false);
    }
  };

  const clearMentorChat = () => {
    setMentorMessages([
      {
        id: 'welcome-mentor',
        sender: 'assistant',
        text: 'Chat history cleared. How can I assist you with your academic goals today?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        student,
        isProfileComplete,
        saveProfile,
        logout,
        resetAllData,
        loadSampleTemplate,
        firebaseUser,
        isAuthLoading,
        cloudSyncStatus,
        lastCloudSync,
        cloudError,
        clearCloudError,
        signInWithGoogle,
        signInAsGuest,
        signInWithEmail,
        signUpWithEmail,
        firebaseSignOut,
        syncToFirestoreNow,
        loadFromFirestoreNow,
        testCloudConnection,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        attendanceRecords,
        recordAttendance,
        deleteAttendanceRecord,
        todos,
        addTodo,
        updateTodo,
        toggleTodoComplete,
        deleteTodo,
        risks,
        updateRiskStatus,
        refreshRisks,
        schedule,
        generateSchedule,
        toggleScheduleTaskComplete,
        deleteScheduleTask,
        mentorMessages,
        isMentorTyping,
        sendMentorQuery,
        clearMentorChat,
        isAssistantDrawerOpen,
        setIsAssistantDrawerOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
