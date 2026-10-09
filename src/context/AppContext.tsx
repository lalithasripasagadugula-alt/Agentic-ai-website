import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface AppContextType {
  // Navigation & Authentication
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  student: StudentProfile | null;
  isProfileComplete: boolean;
  saveProfile: (profile: StudentProfile) => void;
  logout: () => void;
  resetAllData: () => void;
  loadSampleTemplate: () => void;

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

  const [student, setStudent] = useState<StudentProfile | null>(
    initial?.student || null
  );
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

  const isProfileComplete = Boolean(student?.isProfileComplete);

  // Automatically recalculate risks when subjects, todos, or target percentage change
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

  // Profile actions
  const saveProfile = (newProfile: StudentProfile) => {
    const completeProfile: StudentProfile = {
      ...newProfile,
      isProfileComplete: true,
    };
    setStudent(completeProfile);
    setActiveTab('dashboard');
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
      email: 'aarav.sharma@campus.edu',
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
  };

  // Subject actions
  const addSubject = (newSub: Omit<Subject, 'id'>) => {
    const subject: Subject = {
      ...newSub,
      id: `subj-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, subject]);
  };

  const updateSubject = (id: string, updated: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setAttendanceRecords((prev) => prev.filter((r) => r.subjectId !== id));
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

    // Check if record already exists for this subject on this date
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

      // Adjust subject aggregate numbers if old status was different
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
      // Create new record
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

      // Increment subject aggregate counts
      let newAttended = targetSub.attendedClasses;
      let newTotal = targetSub.totalClasses;

      if (status === 'present') {
        newAttended += 1;
        newTotal += 1;
      } else if (status === 'absent') {
        newTotal += 1;
      } // If excused, do not increment total conducted classes

      updateSubject(subjectId, { attendedClasses: newAttended, totalClasses: newTotal });
    }

    setAttendanceRecords(updatedRecords);
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

    setAttendanceRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  // To-Do actions
  const addTodo = (newTodo: Omit<TodoTask, 'id' | 'createdAt'>) => {
    const todo: TodoTask = {
      ...newTodo,
      id: `todo-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTodos((prev) => [todo, ...prev]);
  };

  const updateTodo = (id: string, updated: Partial<TodoTask>) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const toggleTodoComplete = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Risks actions
  const updateRiskStatus = (id: string, status: 'Open' | 'In Progress' | 'Resolved') => {
    setRisks((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const refreshRisks = () => {
    if (student) {
      const detected = analyzeAcademicRisks({
        subjects,
        todos,
        profile: student,
      });
      setRisks(detected);
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
  };

  const toggleScheduleTaskComplete = (id: string) => {
    setSchedule((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteScheduleTask = (id: string) => {
    setSchedule((prev) => prev.filter((t) => t.id !== id));
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
