export type NavPage =
  | 'overview'
  | 'planner'
  | 'notes'
  | 'assignments'
  | 'quiz'
  | 'analytics'
  | 'settings'
  | 'profile';

export type AssignmentStatus = 'pending' | 'in-progress' | 'completed';
export type AssignmentPriority = 'low' | 'medium' | 'high';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type StudySessionSource = 'manual' | 'smart-plan';

export interface Subject {
  id: string;
  code: string;
  name: string;
  instructor: string;
  examDate: string; // YYYY-MM-DD or ''
  color: string; // Hex color for chart series & subtle subject markers
}

export interface Topic {
  id: string;
  subjectId: string;
  chapter: string;
  title: string;
  estimatedHours: number;
  completed: boolean;
}

export interface StudySession {
  id: string;
  subjectId: string;
  topicId?: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  completed: boolean;
  source: StudySessionSource;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: AssignmentPriority;
  status: AssignmentStatus;
  createdAt: string; // ISO
  completedAt?: string; // ISO
}

export interface Note {
  id: string;
  title: string;
  subjectId: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface QuizQuestion {
  id: string;
  subjectName: string;
  topic: string;
  difficulty: QuizDifficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  subjectName: string;
  topic: string;
  difficulty: QuizDifficulty | 'mixed';
  totalQuestions: number;
  score: number;
  completedAt: string; // ISO
  questionIds: string[];
  answers: Record<string, number>;
}

export interface ActivityLog {
  id: string;
  type: 'study' | 'assignment' | 'note' | 'quiz' | 'planner';
  description: string;
  timestamp: string; // ISO
}

export interface UserProfile {
  name: string;
  email: string;
  university: string;
  major: string;
  year: string;
  bio: string;
  avatarUrl: string;
}

export interface StudyPreferences {
  dailyStudyGoalHours: number;
  preferredStartHour: number; // 0-23
  preferredEndHour: number; // 0-23
  focusBlockMinutes: number; // 25 | 45 | 60 | 90
  weekStartsOn: 'monday' | 'sunday';
  showCompletedInOverview: boolean;
}

export interface CampusPilotData {
  profile: UserProfile;
  preferences: StudyPreferences;
  subjects: Subject[];
  topics: Topic[];
  studySessions: StudySession[];
  assignments: Assignment[];
  notes: Note[];
  quizAttempts: QuizAttempt[];
  activityLog: ActivityLog[];
}

export type QuickActionTrigger =
  | 'add-assignment'
  | 'create-note'
  | 'plan-session'
  | 'generate-quiz'
  | null;
