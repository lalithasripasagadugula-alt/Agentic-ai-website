import {
  Subject,
  DailyAttendanceRecord,
  AcademicRisk,
  ScheduledTask,
  TodoTask,
  StudentProfile,
} from '../types';

/**
 * Calculates attendance percentage: (Classes Attended / Total Classes Conducted) * 100
 */
export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total <= 0) return 0;
  return Number(((attended / total) * 100).toFixed(1));
}

/**
 * Calculates number of consecutive classes a student must attend
 * to reach their configured target percentage (e.g. 75%)
 *
 * Formula:
 * (attended + c) / (total + c) >= target / 100
 * c * (100 - target) >= target * total - 100 * attended
 * c = ceil((target * total - 100 * attended) / (100 - target))
 */
export function calculateClassesNeededForTarget(
  attended: number,
  total: number,
  target: number = 75
): number {
  if (total <= 0) return 0;
  const currentPct = (attended / total) * 100;
  if (currentPct >= target) return 0;
  if (target >= 100) return Infinity;

  const numerator = (target / 100) * total - attended;
  const denominator = 1 - target / 100;
  const needed = Math.ceil(numerator / denominator);
  return Math.max(0, needed);
}

/**
 * Calculates number of classes a student can safely miss
 * before falling below their target percentage
 *
 * Formula:
 * attended / (total + m) >= target / 100
 * m <= (100 * attended / target) - total
 */
export function calculateSafeClassesToMiss(
  attended: number,
  total: number,
  target: number = 75
): number {
  if (total <= 0) return 0;
  const currentPct = (attended / total) * 100;
  if (currentPct < target) return 0;
  if (target <= 0) return Infinity;

  const maxTotal = attended / (target / 100);
  const safe = Math.floor(maxTotal - total);
  return Math.max(0, safe);
}

/**
 * Returns human-readable label and styling based on target threshold
 */
export function getAttendanceStatus(
  currentPct: number,
  target: number = 75
): {
  label: 'Safe' | 'Near Target' | 'Below Target';
  colorClass: string;
  badgeBg: string;
} {
  if (currentPct >= target + 5) {
    return {
      label: 'Safe',
      colorClass: 'text-[#0B757B]',
      badgeBg: 'bg-[#A5E6E2]/40 text-[#0B757B] border-[#77DAD7]',
    };
  }
  if (currentPct >= target) {
    return {
      label: 'Near Target',
      colorClass: 'text-amber-700',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }
  return {
    label: 'Below Target',
    colorClass: 'text-rose-700',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
  };
}

/**
 * Rule-based Academic Risk Analysis Engine
 * Scans only actual student-entered data
 */
export function analyzeAcademicRisks(params: {
  subjects: Subject[];
  todos: TodoTask[];
  profile: StudentProfile | null;
  existingRisks?: AcademicRisk[];
}): AcademicRisk[] {
  const { subjects, todos, profile } = params;
  const detectedRisks: AcademicRisk[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  const targetAttendance = profile?.attendanceTargetPercent || 75;

  // 1. Subject-level attendance risk analysis
  subjects.forEach((subj) => {
    if (subj.totalClasses > 0) {
      const pct = calculateAttendancePercentage(subj.attendedClasses, subj.totalClasses);
      if (pct < targetAttendance) {
        const classesNeeded = calculateClassesNeededForTarget(
          subj.attendedClasses,
          subj.totalClasses,
          targetAttendance
        );
        const isCritical = pct < targetAttendance - 10;

        detectedRisks.push({
          id: `risk-att-${subj.id}`,
          title: `Attendance Deficit — ${subj.name}`,
          subjectId: subj.id,
          subjectName: `${subj.code ? subj.code + ' ' : ''}${subj.name}`,
          category: 'Attendance',
          severity: isCritical ? 'High' : 'Medium',
          triggerData: `Recorded attendance is ${pct}% (${subj.attendedClasses}/${subj.totalClasses} classes), which is ${(targetAttendance - pct).toFixed(1)}% below your target (${targetAttendance}%).`,
          whyItMatters:
            'Falling below the institutional threshold triggers eligibility debarment from semester examinations.',
          recommendedAction:
            classesNeeded > 0
              ? `Attend the next ${classesNeeded} consecutive lectures without missing any to restore eligibility.`
              : `Attend upcoming scheduled classes consistently to maintain safe standing.`,
          priority: isCritical ? 'Urgent' : 'High',
          suggestedDate: todayStr,
          status: 'Open',
          createdAt: todayStr,
        });
      }
    }

    // 2. Internal examination marks risk analysis
    if (
      subj.internalMarksObtained !== undefined &&
      subj.maxInternalMarks !== undefined &&
      subj.maxInternalMarks > 0
    ) {
      const marksPct = (subj.internalMarksObtained / subj.maxInternalMarks) * 100;
      if (marksPct < 55) {
        const isVeryLow = marksPct < 40;
        detectedRisks.push({
          id: `risk-marks-${subj.id}`,
          title: `Low Internal Marks — ${subj.name}`,
          subjectId: subj.id,
          subjectName: `${subj.code ? subj.code + ' ' : ''}${subj.name}`,
          category: 'Internal Marks',
          severity: isVeryLow ? 'High' : 'Medium',
          triggerData: `Scored ${subj.internalMarksObtained} out of ${subj.maxInternalMarks} in continuous evaluations (${marksPct.toFixed(1)}%).`,
          whyItMatters:
            'Low continuous assessment scores directly reduce your overall semester grade and increase backlog probability.',
          recommendedAction:
            'Review past test mistakes, consult faculty for re-assessment or remedial work, and increase daily revision hours for this subject.',
          priority: isVeryLow ? 'Urgent' : 'High',
          suggestedDate: todayStr,
          status: 'Open',
          createdAt: todayStr,
        });
      }
    }

    // 3. Subject Difficulty flagged without sufficient attendance
    if (subj.difficulty === 'Hard' && subj.totalClasses > 0) {
      const pct = calculateAttendancePercentage(subj.attendedClasses, subj.totalClasses);
      if (pct < 80) {
        detectedRisks.push({
          id: `risk-diff-${subj.id}`,
          title: `Challenging Subject Needs Reinforcement — ${subj.name}`,
          subjectId: subj.id,
          subjectName: subj.name,
          category: 'Study Deficit',
          severity: 'Low',
          triggerData: `Subject marked as 'Hard' difficulty with attendance standing at ${pct}%.`,
          whyItMatters:
            'Difficult subjects require regular lecture exposure to prevent last-minute exam cramming.',
          recommendedAction:
            'Allocate at least 45 minutes of scheduled self-study every alternate day for concept mastery.',
          priority: 'Medium',
          suggestedDate: todayStr,
          status: 'Open',
          createdAt: todayStr,
        });
      }
    }
  });

  // 4. Overdue or Urgent Assignments Analysis
  todos
    .filter((t) => !t.completed)
    .forEach((todo) => {
      if (todo.deadline) {
        const deadlineDate = new Date(todo.deadline);
        const todayDate = new Date(todayStr);
        const diffDays = Math.ceil(
          (deadlineDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays < 0) {
          detectedRisks.push({
            id: `risk-todo-overdue-${todo.id}`,
            title: `Overdue Assignment: ${todo.title}`,
            subjectName: todo.subjectName || 'General Coursework',
            category: 'Overdue Assignment',
            severity: 'High',
            triggerData: `Deadline was ${todo.deadline} (${Math.abs(diffDays)} day(s) overdue).`,
            whyItMatters:
              'Late submissions often incur severe grade deductions or zero marks on internal assessment.',
            recommendedAction:
              'Complete and submit this deliverable immediately before portal closure or faculty grading lock.',
            priority: 'Urgent',
            suggestedDate: todayStr,
            status: 'Open',
            createdAt: todayStr,
          });
        } else if (diffDays <= 2 && todo.priority === 'Urgent') {
          detectedRisks.push({
            id: `risk-todo-urgent-${todo.id}`,
            title: `Imminent Deadline: ${todo.title}`,
            subjectName: todo.subjectName || 'General Coursework',
            category: 'Overdue Assignment',
            severity: 'Medium',
            triggerData: `Deadline is in ${diffDays === 0 ? 'today' : diffDays + ' day(s)'} (${todo.deadline}).`,
            whyItMatters:
              'Multiple deliverables competing for the same study hours create submission bottlenecks.',
            recommendedAction:
              'Block dedicated 60-90 minutes tonight to finish and verify submission requirements.',
            priority: 'High',
            suggestedDate: todo.deadline,
            status: 'Open',
            createdAt: todayStr,
          });
        }
      }
    });

  return detectedRisks;
}

/**
 * Generates an adaptive, non-overlapping 7-day academic recovery schedule
 */
export function generateDeterministicSchedule(params: {
  subjects: Subject[];
  risks: AcademicRisk[];
  todos: TodoTask[];
  profile: StudentProfile | null;
}): ScheduledTask[] {
  const { subjects, risks, todos, profile } = params;
  const tasks: ScheduledTask[] = [];

  const availableHours = profile?.dailyStudyHours || 3;
  const preferredTime = profile?.preferredStudyTime || 'Evening';

  // Base start hour based on preferred time
  let baseHour = 18; // Default evening 18:00
  if (preferredTime === 'Morning') baseHour = 8;
  if (preferredTime === 'Afternoon') baseHour = 14;
  if (preferredTime === 'Night') baseHour = 20;

  const today = new Date();

  // Create daily study blocks over the next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const dayDate = new Date();
    dayDate.setDate(today.getDate() + dayOffset);
    const dateStr = dayDate.toISOString().split('T')[0];

    let currentHour = baseHour;
    let allocatedMinutesToday = 0;
    const maxMinutesToday = availableHours * 60;

    // Pick top uncompleted tasks or high-priority risks
    if (dayOffset === 0) {
      // Day 1: Focus on urgent todos & high severity risks
      const urgentTodo = todos.find((t) => !t.completed && (t.priority === 'Urgent' || t.priority === 'High'));
      if (urgentTodo) {
        const start = `${String(currentHour).padStart(2, '0')}:00`;
        const end = `${String(currentHour + 1).padStart(2, '0')}:30`;
        tasks.push({
          id: `sched-todo-${urgentTodo.id}-${dayOffset}`,
          date: dateStr,
          startTime: start,
          endTime: end,
          subjectName: urgentTodo.subjectName || 'Coursework',
          taskDescription: `Complete deliverable: ${urgentTodo.title}`,
          priority: 'Urgent',
          durationMinutes: 90,
          relatedRiskOrGoal: 'Imminent assessment deadline resolution',
          completed: false,
        });
        currentHour += 2;
        allocatedMinutesToday += 90;
      }
    }

    // Allocate subject revision for subjects with risks or difficulty
    const prioritizedSubjects = [...subjects].sort((a, b) => {
      const aRisk = risks.some((r) => r.subjectId === a.id);
      const bRisk = risks.some((r) => r.subjectId === b.id);
      if (aRisk && !bRisk) return -1;
      if (!aRisk && bRisk) return 1;
      return a.difficulty === 'Hard' ? -1 : 1;
    });

    const targetSubject = prioritizedSubjects[dayOffset % Math.max(1, prioritizedSubjects.length)];

    if (targetSubject && allocatedMinutesToday < maxMinutesToday) {
      const remainingMinutes = Math.min(90, maxMinutesToday - allocatedMinutesToday);
      if (remainingMinutes >= 45) {
        const start = `${String(currentHour).padStart(2, '0')}:00`;
        const endHour = currentHour + Math.floor(remainingMinutes / 60);
        const endMin = remainingMinutes % 60;
        const end = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

        const isRiskSubject = risks.some((r) => r.subjectId === targetSubject.id);

        tasks.push({
          id: `sched-rev-${targetSubject.id}-${dayOffset}`,
          date: dateStr,
          startTime: start,
          endTime: end,
          subjectId: targetSubject.id,
          subjectName: targetSubject.name,
          taskDescription: isRiskSubject
            ? `Remedial core revision & test problem practice for ${targetSubject.name}`
            : `Concept review & lecture notes consolidation for ${targetSubject.name}`,
          priority: isRiskSubject ? 'High' : 'Medium',
          durationMinutes: remainingMinutes,
          relatedRiskOrGoal: isRiskSubject ? 'Addressing identified academic deficit' : 'Regular mastery pacing',
          completed: false,
        });
      }
    }
  }

  return tasks;
}
