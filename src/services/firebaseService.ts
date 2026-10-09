import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  StudentProfile,
  Subject,
  DailyAttendanceRecord,
  TodoTask,
  AcademicRisk,
  ScheduledTask,
} from '../types';

export interface FullStudentData {
  profile: StudentProfile | null;
  subjects: Subject[];
  attendanceRecords: DailyAttendanceRecord[];
  todos: TodoTask[];
  risks: AcademicRisk[];
  schedule: ScheduledTask[];
}

// Helper to determine sanitized path
function getCleanId(id: string): string {
  return encodeURIComponent(id.trim().replace(/\//g, '_'));
}

/**
 * Saves a student's profile to Firestore under users/{id}/profile/main and students/{studentId}/profile/main
 */
export async function saveStudentProfileToFirestore(
  identifier: string,
  profile: StudentProfile
): Promise<void> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/profile/main`;
  try {
    const dataToSave = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };

    // Save under primary user path
    const profileRef = doc(db, 'users', cleanId, 'profile', 'main');
    await setDoc(profileRef, dataToSave, { merge: true });

    // Also persist under students collection by studentId if available
    if (profile.studentId && profile.studentId.trim() !== cleanId) {
      const studentCleanId = getCleanId(profile.studentId);
      const studentDocRef = doc(db, 'students', studentCleanId, 'profile', 'main');
      await setDoc(studentDocRef, dataToSave, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads a student's profile from Firestore by userId or studentId
 */
export async function loadStudentProfileFromFirestore(
  identifier: string
): Promise<StudentProfile | null> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/profile/main`;
  try {
    // 1. Try users/{id}/profile/main
    const profileRef = doc(db, 'users', cleanId, 'profile', 'main');
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      return snap.data() as StudentProfile;
    }

    // 2. Try students/{id}/profile/main
    const studentProfileRef = doc(db, 'students', cleanId, 'profile', 'main');
    const studentSnap = await getDoc(studentProfileRef);
    if (studentSnap.exists()) {
      return studentSnap.data() as StudentProfile;
    }

    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Saves subjects array to Firestore subcollection
 */
export async function saveSubjectsToFirestore(
  identifier: string,
  subjects: Subject[]
): Promise<void> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/subjects`;
  try {
    const batch = writeBatch(db);
    subjects.forEach((subj) => {
      const docRef = doc(db, 'users', cleanId, 'subjects', subj.id);
      batch.set(docRef, { ...subj, updatedAt: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads subjects from Firestore subcollection
 */
export async function loadSubjectsFromFirestore(
  identifier: string
): Promise<Subject[]> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/subjects`;
  try {
    // Check users collection first
    const snap = await getDocs(collection(db, 'users', cleanId, 'subjects'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as Subject);
    }

    // Check students collection fallback
    const studentSnap = await getDocs(collection(db, 'students', cleanId, 'subjects'));
    return studentSnap.docs.map((d) => d.data() as Subject);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Saves attendance records to Firestore subcollection
 */
export async function saveAttendanceRecordsToFirestore(
  identifier: string,
  records: DailyAttendanceRecord[]
): Promise<void> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/attendance`;
  try {
    const batch = writeBatch(db);
    records.forEach((rec) => {
      const docRef = doc(db, 'users', cleanId, 'attendance', rec.id);
      batch.set(docRef, rec, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads attendance records from Firestore
 */
export async function loadAttendanceRecordsFromFirestore(
  identifier: string
): Promise<DailyAttendanceRecord[]> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/attendance`;
  try {
    const snap = await getDocs(collection(db, 'users', cleanId, 'attendance'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as DailyAttendanceRecord);
    }

    const studentSnap = await getDocs(collection(db, 'students', cleanId, 'attendance'));
    return studentSnap.docs.map((d) => d.data() as DailyAttendanceRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Saves todos to Firestore subcollection
 */
export async function saveTodosToFirestore(
  identifier: string,
  todos: TodoTask[]
): Promise<void> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/todos`;
  try {
    const batch = writeBatch(db);
    todos.forEach((todo) => {
      const docRef = doc(db, 'users', cleanId, 'todos', todo.id);
      batch.set(docRef, todo, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads todos from Firestore
 */
export async function loadTodosFromFirestore(
  identifier: string
): Promise<TodoTask[]> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/todos`;
  try {
    const snap = await getDocs(collection(db, 'users', cleanId, 'todos'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as TodoTask);
    }

    const studentSnap = await getDocs(collection(db, 'students', cleanId, 'todos'));
    return studentSnap.docs.map((d) => d.data() as TodoTask);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Saves risks to Firestore subcollection
 */
export async function saveRisksToFirestore(
  identifier: string,
  risks: AcademicRisk[]
): Promise<void> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/risks`;
  try {
    const batch = writeBatch(db);
    risks.forEach((risk) => {
      const docRef = doc(db, 'users', cleanId, 'risks', risk.id);
      batch.set(docRef, risk, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads risks from Firestore
 */
export async function loadRisksFromFirestore(
  identifier: string
): Promise<AcademicRisk[]> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/risks`;
  try {
    const snap = await getDocs(collection(db, 'users', cleanId, 'risks'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as AcademicRisk);
    }

    const studentSnap = await getDocs(collection(db, 'students', cleanId, 'risks'));
    return studentSnap.docs.map((d) => d.data() as AcademicRisk);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Saves recovery schedule to Firestore subcollection
 */
export async function saveScheduleToFirestore(
  identifier: string,
  schedule: ScheduledTask[]
): Promise<void> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/schedule`;
  try {
    const batch = writeBatch(db);
    schedule.forEach((task) => {
      const docRef = doc(db, 'users', cleanId, 'schedule', task.id);
      batch.set(docRef, task, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads recovery schedule from Firestore
 */
export async function loadScheduleFromFirestore(
  identifier: string
): Promise<ScheduledTask[]> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}/schedule`;
  try {
    const snap = await getDocs(collection(db, 'users', cleanId, 'schedule'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as ScheduledTask);
    }

    const studentSnap = await getDocs(collection(db, 'students', cleanId, 'schedule'));
    return studentSnap.docs.map((d) => d.data() as ScheduledTask);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Batch saves all student data into Firestore
 */
export async function syncAllStudentDataToFirestore(
  identifier: string,
  data: FullStudentData
): Promise<void> {
  const cleanId = getCleanId(identifier);
  const path = `users/${cleanId}`;
  try {
    if (data.profile) {
      await saveStudentProfileToFirestore(cleanId, data.profile);
    }
    if (data.subjects.length > 0) {
      await saveSubjectsToFirestore(cleanId, data.subjects);
    }
    if (data.attendanceRecords.length > 0) {
      await saveAttendanceRecordsToFirestore(cleanId, data.attendanceRecords);
    }
    if (data.todos.length > 0) {
      await saveTodosToFirestore(cleanId, data.todos);
    }
    if (data.risks.length > 0) {
      await saveRisksToFirestore(cleanId, data.risks);
    }
    if (data.schedule.length > 0) {
      await saveScheduleToFirestore(cleanId, data.schedule);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches all student records for a user/student from Firestore
 */
export async function fetchAllStudentDataFromFirestore(
  identifier: string
): Promise<FullStudentData> {
  const cleanId = getCleanId(identifier);
  const profile = await loadStudentProfileFromFirestore(cleanId);
  const subjects = await loadSubjectsFromFirestore(cleanId);
  const attendanceRecords = await loadAttendanceRecordsFromFirestore(cleanId);
  const todos = await loadTodosFromFirestore(cleanId);
  const risks = await loadRisksFromFirestore(cleanId);
  const schedule = await loadScheduleFromFirestore(cleanId);

  return {
    profile,
    subjects,
    attendanceRecords,
    todos,
    risks,
    schedule,
  };
}
