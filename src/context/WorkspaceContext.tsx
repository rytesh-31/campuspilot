import React, { createContext, useContext, useEffect, useState } from 'react';
import { createSeedData } from '../data/seedData';
import {
  ActivityLog,
  Assignment,
  AssignmentStatus,
  CampusPilotData,
  NavPage,
  Note,
  QuickActionTrigger,
  QuizAttempt,
  StudyPreferences,
  StudySession,
  Subject,
  Topic,
  UserProfile,
} from '../types/academic';

const STORAGE_KEY = 'campuspilot_workspace_v1';

interface WorkspaceContextValue {
  data: CampusPilotData;
  activePage: NavPage;
  setActivePage: (page: NavPage) => void;
  quickAction: QuickActionTrigger;
  setQuickAction: (action: QuickActionTrigger) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  navigateWithAction: (page: NavPage, action?: QuickActionTrigger) => void;

  // Subjects & Topics
  addSubject: (subject: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, updates: Partial<Omit<Subject, 'id'>>) => void;
  deleteSubject: (id: string) => void;
  addTopic: (topic: Omit<Topic, 'id'>) => Topic;
  updateTopic: (id: string, updates: Partial<Omit<Topic, 'id'>>) => void;
  deleteTopic: (id: string) => void;

  // Study Sessions
  addStudySession: (session: Omit<StudySession, 'id'>) => StudySession;
  updateStudySession: (id: string, updates: Partial<Omit<StudySession, 'id'>>) => void;
  deleteStudySession: (id: string) => void;
  toggleStudySessionCompleted: (id: string) => void;
  applySmartPlanSessions: (sessions: StudySession[], replaceSmartPlan: boolean) => void;

  // Assignments
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => Assignment;
  updateAssignment: (id: string, updates: Partial<Omit<Assignment, 'id' | 'createdAt'>>) => void;
  deleteAssignment: (id: string) => void;
  setAssignmentStatus: (id: string, status: AssignmentStatus) => void;

  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Quizzes
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => QuizAttempt;

  // Profile, Preferences & Reset
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (updates: Partial<StudyPreferences>) => void;
  resetToSampleData: () => void;
  clearWorkspaceData: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

function loadInitialData(): CampusPilotData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedData();
    const parsed = JSON.parse(raw) as Partial<CampusPilotData>;
    const seed = createSeedData();
    return {
      profile: { ...seed.profile, ...(parsed.profile || {}) },
      preferences: { ...seed.preferences, ...(parsed.preferences || {}) },
      subjects: Array.isArray(parsed.subjects) ? parsed.subjects : seed.subjects,
      topics: Array.isArray(parsed.topics) ? parsed.topics : seed.topics,
      studySessions: Array.isArray(parsed.studySessions)
        ? parsed.studySessions
        : seed.studySessions,
      assignments: Array.isArray(parsed.assignments)
        ? parsed.assignments
        : seed.assignments,
      notes: Array.isArray(parsed.notes) ? parsed.notes : seed.notes,
      quizAttempts: Array.isArray(parsed.quizAttempts)
        ? parsed.quizAttempts
        : seed.quizAttempts,
      activityLog: Array.isArray(parsed.activityLog)
        ? parsed.activityLog
        : seed.activityLog,
    };
  } catch {
    return createSeedData();
  }
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CampusPilotData>(loadInitialData);
  const [activePage, setActivePage] = useState<NavPage>('overview');
  const [quickAction, setQuickAction] = useState<QuickActionTrigger>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => {
    const initial = loadInitialData();
    return initial.notes[0]?.id || null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [data]);

  const appendActivity = (
    prevLog: ActivityLog[],
    type: ActivityLog['type'],
    description: string,
  ): ActivityLog[] => {
    const entry: ActivityLog = {
      id: makeId('act'),
      type,
      description,
      timestamp: new Date().toISOString(),
    };
    return [entry, ...prevLog].slice(0, 30);
  };

  const navigateWithAction = (page: NavPage, action: QuickActionTrigger = null) => {
    setActivePage(page);
    if (action) {
      setQuickAction(action);
    }
  };

  const addSubject = (subject: Omit<Subject, 'id'>): Subject => {
    const created: Subject = { ...subject, id: makeId('subj') };
    setData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, created],
      activityLog: appendActivity(
        prev.activityLog,
        'planner',
        `Added subject: ${created.code ? `${created.code} · ` : ''}${created.name}`,
      ),
    }));
    return created;
  };

  const updateSubject = (id: string, updates: Partial<Omit<Subject, 'id'>>) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      topics: prev.topics.filter((t) => t.subjectId !== id),
      studySessions: prev.studySessions.filter((ss) => ss.subjectId !== id),
      assignments: prev.assignments.filter((a) => a.subjectId !== id),
      notes: prev.notes.filter((n) => n.subjectId !== id),
    }));
  };

  const addTopic = (topic: Omit<Topic, 'id'>): Topic => {
    const created: Topic = { ...topic, id: makeId('top') };
    setData((prev) => ({
      ...prev,
      topics: [...prev.topics, created],
    }));
    return created;
  };

  const updateTopic = (id: string, updates: Partial<Omit<Topic, 'id'>>) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTopic = (id: string) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t.id !== id),
    }));
  };

  const addStudySession = (session: Omit<StudySession, 'id'>): StudySession => {
    const created: StudySession = { ...session, id: makeId('sess') };
    setData((prev) => ({
      ...prev,
      studySessions: [...prev.studySessions, created],
      activityLog: appendActivity(
        prev.activityLog,
        'study',
        `Scheduled ${created.durationMinutes}m session: ${created.title}`,
      ),
    }));
    return created;
  };

  const updateStudySession = (
    id: string,
    updates: Partial<Omit<StudySession, 'id'>>,
  ) => {
    setData((prev) => ({
      ...prev,
      studySessions: prev.studySessions.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    }));
  };

  const deleteStudySession = (id: string) => {
    setData((prev) => ({
      ...prev,
      studySessions: prev.studySessions.filter((s) => s.id !== id),
    }));
  };

  const toggleStudySessionCompleted = (id: string) => {
    setData((prev) => {
      const target = prev.studySessions.find((s) => s.id === id);
      if (!target) return prev;
      const nextCompleted = !target.completed;
      return {
        ...prev,
        studySessions: prev.studySessions.map((s) =>
          s.id === id ? { ...s, completed: nextCompleted } : s,
        ),
        activityLog: nextCompleted
          ? appendActivity(
              prev.activityLog,
              'study',
              `Completed ${target.durationMinutes}m study session: ${target.title}`,
            )
          : prev.activityLog,
      };
    });
  };

  const applySmartPlanSessions = (
    newSessions: StudySession[],
    replaceSmartPlan: boolean,
  ) => {
    setData((prev) => {
      const baseSessions = replaceSmartPlan
        ? prev.studySessions.filter((s) => s.source !== 'smart-plan' || s.completed)
        : prev.studySessions;
      return {
        ...prev,
        studySessions: [...baseSessions, ...newSessions],
        activityLog: appendActivity(
          prev.activityLog,
          'planner',
          `Generated smart study schedule (${newSessions.length} sessions)`,
        ),
      };
    });
  };

  const addAssignment = (
    assignment: Omit<Assignment, 'id' | 'createdAt'>,
  ): Assignment => {
    const now = new Date().toISOString();
    const created: Assignment = {
      ...assignment,
      id: makeId('asg'),
      createdAt: now,
      completedAt: assignment.status === 'completed' ? now : undefined,
    };
    setData((prev) => ({
      ...prev,
      assignments: [created, ...prev.assignments],
      activityLog: appendActivity(
        prev.activityLog,
        'assignment',
        `Added assignment: ${created.title}`,
      ),
    }));
    return created;
  };

  const updateAssignment = (
    id: string,
    updates: Partial<Omit<Assignment, 'id' | 'createdAt'>>,
  ) => {
    setData((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => {
        if (a.id !== id) return a;
        const nextStatus = updates.status ?? a.status;
        return {
          ...a,
          ...updates,
          completedAt:
            nextStatus === 'completed'
              ? a.completedAt || new Date().toISOString()
              : undefined,
        };
      }),
    }));
  };

  const deleteAssignment = (id: string) => {
    setData((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));
  };

  const setAssignmentStatus = (id: string, status: AssignmentStatus) => {
    setData((prev) => {
      const target = prev.assignments.find((a) => a.id === id);
      if (!target) return prev;
      return {
        ...prev,
        assignments: prev.assignments.map((a) =>
          a.id === id
            ? {
                ...a,
                status,
                completedAt:
                  status === 'completed' ? new Date().toISOString() : undefined,
              }
            : a,
        ),
        activityLog:
          status === 'completed' && target.status !== 'completed'
            ? appendActivity(
                prev.activityLog,
                'assignment',
                `Completed assignment: ${target.title}`,
              )
            : prev.activityLog,
      };
    });
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
    const now = new Date().toISOString();
    const created: Note = {
      ...note,
      id: makeId('note'),
      createdAt: now,
      updatedAt: now,
    };
    setData((prev) => ({
      ...prev,
      notes: [created, ...prev.notes],
      activityLog: appendActivity(
        prev.activityLog,
        'note',
        `Created note: ${created.title || 'Untitled Note'}`,
      ),
    }));
    setSelectedNoteId(created.id);
    return created;
  };

  const updateNote = (
    id: string,
    updates: Partial<Omit<Note, 'id' | 'createdAt'>>,
  ) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === id
          ? { ...n, ...updates, updatedAt: new Date().toISOString() }
          : n,
      ),
    }));
  };

  const deleteNote = (id: string) => {
    setData((prev) => {
      const remaining = prev.notes.filter((n) => n.id !== id);
      if (selectedNoteId === id) {
        setSelectedNoteId(remaining[0]?.id || null);
      }
      return {
        ...prev,
        notes: remaining,
      };
    });
  };

  const togglePinNote = (id: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned } : n,
      ),
    }));
  };

  const recordQuizAttempt = (
    attempt: Omit<QuizAttempt, 'id' | 'completedAt'>,
  ): QuizAttempt => {
    const created: QuizAttempt = {
      ...attempt,
      id: makeId('qa'),
      completedAt: new Date().toISOString(),
    };
    const pct = Math.round((created.score / Math.max(1, created.totalQuestions)) * 100);
    setData((prev) => ({
      ...prev,
      quizAttempts: [created, ...prev.quizAttempts],
      activityLog: appendActivity(
        prev.activityLog,
        'quiz',
        `Scored ${created.score}/${created.totalQuestions} (${pct}%) on ${created.subjectName} quiz`,
      ),
    }));
    return created;
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  };

  const updatePreferences = (updates: Partial<StudyPreferences>) => {
    setData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }));
  };

  const resetToSampleData = () => {
    const fresh = createSeedData();
    setData(fresh);
    setSelectedNoteId(fresh.notes[0]?.id || null);
  };

  const clearWorkspaceData = () => {
    const seed = createSeedData();
    const empty: CampusPilotData = {
      profile: data.profile,
      preferences: data.preferences,
      subjects: [],
      topics: [],
      studySessions: [],
      assignments: [],
      notes: [],
      quizAttempts: [],
      activityLog: [],
    };
    // Keep profile avatar fallback if cleared
    if (!empty.profile.avatarUrl) {
      empty.profile.avatarUrl = seed.profile.avatarUrl;
    }
    setData(empty);
    setSelectedNoteId(null);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        data,
        activePage,
        setActivePage,
        quickAction,
        setQuickAction,
        selectedNoteId,
        setSelectedNoteId,
        navigateWithAction,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        updateTopic,
        deleteTopic,
        addStudySession,
        updateStudySession,
        deleteStudySession,
        toggleStudySessionCompleted,
        applySmartPlanSessions,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        setAssignmentStatus,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        recordQuizAttempt,
        updateProfile,
        updatePreferences,
        resetToSampleData,
        clearWorkspaceData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used inside WorkspaceProvider');
  }
  return ctx;
}
