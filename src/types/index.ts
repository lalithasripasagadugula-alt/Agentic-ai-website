export type NavigationTab =
  | 'home'
  | 'dashboard'
  | 'subjects'
  | 'attendance'
  | 'todos'
  | 'risks'
  | 'schedule'
  | 'mentor'
  | 'analytics'
  | 'feedback'
  | 'profile'
  | 'settings';

export interface StudentProfile {
  fullName: string;
  email: string;
  collegeName: string;
  branch: string;
  academicYear: string;
  semester: string;
  studentId: string;
  dailyStudyHours: number;
  preferredStudyTime: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  academicGoals?: string;
  existingDifficulties?: string;
  attendanceTargetPercent: number;
  isProfileComplete: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  faculty?: string;
  totalClasses: number;
  attendedClasses: number;
  targetAttendance: number;
  internalMarksObtained?: number;
  maxInternalMarks?: number;
  upcomingAssessments?: string;
  assignmentDeadlines?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface DailyAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AcademicRisk {
  id: string;
  title: string;
  subjectId?: string;
  subjectName: string;
  category: 'Attendance' | 'Internal Marks' | 'Upcoming Exam' | 'Overdue Assignment' | 'Study Deficit';
  severity: 'Low' | 'Medium' | 'High';
  triggerData: string;
  whyItMatters: string;
  recommendedAction: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  suggestedDate: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface ScheduledTask {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "10:30"
  subjectId?: string;
  subjectName: string;
  taskDescription: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  durationMinutes: number;
  relatedRiskOrGoal: string;
  completed: boolean;
}

export interface TodoTask {
  id: string;
  title: string;
  subjectId?: string;
  subjectName: string;
  deadline: string; // YYYY-MM-DD
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isLiveAI?: boolean;
  source?: 'n8n' | 'gemini' | 'rules';
}
