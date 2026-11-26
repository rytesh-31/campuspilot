import { StudyPreferences, StudySession, Subject, Topic } from '../types/academic';
import { addDays, diffInDays, getTodayISO } from './dateUtils';

export interface SmartPlanResult {
  sessions: StudySession[];
  totalHoursScheduled: number;
  unscheduledTopicsCount: number;
  prioritizedSubjects: Array<{
    subjectName: string;
    examDate: string;
    daysUntilExam: number | null;
    sessionsCount: number;
  }>;
  warnings: string[];
}

/**
 * Rule-based smart study planner:
 * 1. Filters incomplete topics across all subjects.
 * 2. Scores each topic by exam proximity (subjects with closer exam dates receive higher urgency).
 * 3. Allocates focus blocks across the planning horizon starting today,
 *    strictly respecting dailyStudyGoalHours and existing scheduled sessions.
 */
export function generateSmartStudyPlan(params: {
  subjects: Subject[];
  topics: Topic[];
  existingSessions: StudySession[];
  preferences: StudyPreferences;
  horizonDays: number;
  replaceExistingSmartPlan: boolean;
}): SmartPlanResult {
  const {
    subjects,
    topics,
    existingSessions,
    preferences,
    horizonDays,
    replaceExistingSmartPlan,
  } = params;

  const today = getTodayISO();
  const maxDailyMinutes = Math.max(30, Math.round(preferences.dailyStudyGoalHours * 60));
  const blockMinutes = Math.max(25, preferences.focusBlockMinutes || 60);
  const startHour = Math.min(20, Math.max(6, preferences.preferredStartHour || 15));

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Keep manual sessions (or all existing if not replacing smart-plan sessions)
  const keptSessions = replaceExistingSmartPlan
    ? existingSessions.filter((s) => s.source !== 'smart-plan' || s.completed)
    : existingSessions;

  // Track minutes already booked per date
  const minutesByDate = new Map<string, number>();
  const sessionsCountByDate = new Map<string, number>();

  keptSessions.forEach((s) => {
    minutesByDate.set(s.date, (minutesByDate.get(s.date) || 0) + s.durationMinutes);
    sessionsCountByDate.set(s.date, (sessionsCountByDate.get(s.date) || 0) + 1);
  });

  // Avoid re-scheduling topics that already have an upcoming uncompleted kept session
  const alreadyScheduledTopicIds = new Set(
    keptSessions
      .filter((s) => !s.completed && s.date >= today && s.topicId)
      .map((s) => s.topicId as string),
  );

  // Build weighted queue of incomplete topics
  const incompleteTopics = topics.filter(
    (t) => !t.completed && !alreadyScheduledTopicIds.has(t.id),
  );

  const scoredTopics = incompleteTopics
    .map((topic) => {
      const subject = subjectMap.get(topic.subjectId);
      const examDate = subject?.examDate || '';
      const daysUntilExam = examDate ? diffInDays(today, examDate) : null;

      // Higher score = scheduled sooner
      let urgency = 10;
      if (daysUntilExam !== null) {
        if (daysUntilExam <= 0) urgency = 120;
        else if (daysUntilExam <= 3) urgency = 100;
        else if (daysUntilExam <= 7) urgency = 80 - daysUntilExam * 2;
        else if (daysUntilExam <= 21) urgency = 55 - daysUntilExam;
        else urgency = 25;
      }

      return {
        topic,
        subject,
        daysUntilExam,
        urgency,
      };
    })
    .sort((a, b) => b.urgency - a.urgency);

  const generatedSessions: StudySession[] = [];
  const warnings: string[] = [];
  let unscheduledTopicsCount = 0;

  // Expand topics into focus blocks based on estimatedHours
  interface WorkBlock {
    topic: Topic;
    subject?: Subject;
    daysUntilExam: number | null;
    durationMinutes: number;
    partIndex: number;
    totalParts: number;
  }

  const workQueue: WorkBlock[] = [];
  scoredTopics.forEach(({ topic, subject, daysUntilExam }) => {
    const neededMinutes = Math.max(blockMinutes, Math.round((topic.estimatedHours || 1) * 60));
    const parts = Math.max(1, Math.min(4, Math.ceil(neededMinutes / blockMinutes)));
    for (let i = 0; i < parts; i++) {
      const remaining = neededMinutes - i * blockMinutes;
      const dur = Math.min(blockMinutes, Math.max(30, remaining));
      workQueue.push({
        topic,
        subject,
        daysUntilExam,
        durationMinutes: dur,
        partIndex: i + 1,
        totalParts: parts,
      });
    }
  });

  // Round-robin / balanced allocation respecting exam deadlines and daily hour cap
  const unscheduledTopicIds = new Set<string>();

  for (const block of workQueue) {
    // Limit scheduling window before exam date if exam is within horizon
    const maxDayOffset =
      block.daysUntilExam !== null && block.daysUntilExam > 0
        ? Math.min(horizonDays - 1, Math.max(0, block.daysUntilExam - 1))
        : horizonDays - 1;

    let placed = false;
    for (let offset = 0; offset <= maxDayOffset; offset++) {
      const candidateDate = addDays(today, offset);
      const usedMinutes = minutesByDate.get(candidateDate) || 0;
      if (usedMinutes + block.durationMinutes <= maxDailyMinutes) {
        const dayIndex = sessionsCountByDate.get(candidateDate) || 0;
        const slotHour = Math.min(21, startHour + Math.floor((usedMinutes / 60) + dayIndex * 0.25));
        const startTime = `${String(slotHour).padStart(2, '0')}:00`;

        const partSuffix =
          block.totalParts > 1 ? ` (Part ${block.partIndex}/${block.totalParts})` : '';

        generatedSessions.push({
          id: `sp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          subjectId: block.topic.subjectId,
          topicId: block.topic.id,
          title: `${block.topic.title}${partSuffix}`,
          date: candidateDate,
          startTime,
          durationMinutes: block.durationMinutes,
          completed: false,
          source: 'smart-plan',
        });

        minutesByDate.set(candidateDate, usedMinutes + block.durationMinutes);
        sessionsCountByDate.set(candidateDate, dayIndex + 1);
        placed = true;
        break;
      }
    }

    if (!placed) {
      unscheduledTopicIds.add(block.topic.id);
    }
  }

  unscheduledTopicsCount = unscheduledTopicIds.size;
  if (unscheduledTopicsCount > 0) {
    warnings.push(
      `${unscheduledTopicsCount} topic${unscheduledTopicsCount > 1 ? 's' : ''} could not fit within your ${preferences.dailyStudyGoalHours}h/day limit over the next ${horizonDays} days.`,
    );
  }

  if (incompleteTopics.length === 0) {
    warnings.push('All syllabus topics are already completed or scheduled.');
  }

  const summaryMap = new Map<
    string,
    { subjectName: string; examDate: string; daysUntilExam: number | null; sessionsCount: number }
  >();

  generatedSessions.forEach((sess) => {
    const subj = subjectMap.get(sess.subjectId);
    if (!subj) return;
    const prev = summaryMap.get(subj.id);
    const daysLeft = subj.examDate ? diffInDays(today, subj.examDate) : null;
    if (prev) {
      prev.sessionsCount += 1;
    } else {
      summaryMap.set(subj.id, {
        subjectName: `${subj.code} · ${subj.name}`,
        examDate: subj.examDate,
        daysUntilExam: daysLeft,
        sessionsCount: 1,
      });
    }
  });

  const totalMinutes = generatedSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return {
    sessions: generatedSessions,
    totalHoursScheduled: Math.round((totalMinutes / 60) * 10) / 10,
    unscheduledTopicsCount,
    prioritizedSubjects: Array.from(summaryMap.values()).sort((a, b) => {
      if (a.daysUntilExam === null && b.daysUntilExam === null) return 0;
      if (a.daysUntilExam === null) return 1;
      if (b.daysUntilExam === null) return -1;
      return a.daysUntilExam - b.daysUntilExam;
    }),
    warnings,
  };
}
