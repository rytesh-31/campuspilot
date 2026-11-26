import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { StudySession, Subject } from '../../types/academic';
import {
  addDays,
  diffInDays,
  formatDayName,
  formatShortDate,
  formatTimeRange,
  getTodayISO,
  getWeekDates,
  parseISODate,
} from '../../utils/dateUtils';
import { generateSmartStudyPlan, SmartPlanResult } from '../../utils/smartPlanner';
import { Modal } from '../common/Modal';

const SUBJECT_COLORS = ['#91A5D5', '#6BA888', '#C79B5E', '#A78BBE', '#C97B7B'];

export const StudyPlannerView: React.FC = () => {
  const {
    data,
    quickAction,
    setQuickAction,
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
    updatePreferences,
  } = useWorkspace();

  const today = getTodayISO();
  const [activeTab, setActiveTab] = useState<'schedule' | 'subjects'>('schedule');
  const [weekOffset, setWeekOffset] = useState(0);

  // Study Session Modal
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessSubjectId, setSessSubjectId] = useState('');
  const [sessTopicId, setSessTopicId] = useState('');
  const [sessTitle, setSessTitle] = useState('');
  const [sessDate, setSessDate] = useState(today);
  const [sessStartTime, setSessStartTime] = useState('15:00');
  const [sessDuration, setSessDuration] = useState(60);
  const [sessError, setSessError] = useState('');

  // Subject Modal
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjCode, setSubjCode] = useState('');
  const [subjName, setSubjName] = useState('');
  const [subjInstructor, setSubjInstructor] = useState('');
  const [subjExamDate, setSubjExamDate] = useState('');
  const [subjColor, setSubjColor] = useState(SUBJECT_COLORS[0]);
  const [subjError, setSubjError] = useState('');

  // Inline Topic Add per subject
  const [topicDrafts, setTopicDrafts] = useState<
    Record<string, { chapter: string; title: string; hours: string }>
  >({});

  // Smart Planner Modal
  const [smartModalOpen, setSmartModalOpen] = useState(false);
  const [horizonDays, setHorizonDays] = useState<7 | 14>(7);
  const [replaceSmartPlan, setReplaceSmartPlan] = useState(true);
  const [smartPreview, setSmartPreview] = useState<SmartPlanResult | null>(null);

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    data.subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [data.subjects]);

  const weekDates = useMemo(() => {
    const ref = parseISODate(addDays(today, weekOffset * 7));
    return getWeekDates(ref, data.preferences.weekStartsOn);
  }, [today, weekOffset, data.preferences.weekStartsOn]);

  const openNewSessionModal = (dateStr: string = today) => {
    setEditingSessionId(null);
    setSessSubjectId(data.subjects[0]?.id || '');
    setSessTopicId('');
    setSessTitle('');
    setSessDate(dateStr);
    setSessStartTime(`${String(data.preferences.preferredStartHour || 15).padStart(2, '0')}:00`);
    setSessDuration(data.preferences.focusBlockMinutes || 60);
    setSessError('');
    setSessionModalOpen(true);
  };

  const openEditSessionModal = (sess: StudySession) => {
    setEditingSessionId(sess.id);
    setSessSubjectId(sess.subjectId);
    setSessTopicId(sess.topicId || '');
    setSessTitle(sess.title);
    setSessDate(sess.date);
    setSessStartTime(sess.startTime);
    setSessDuration(sess.durationMinutes);
    setSessError('');
    setSessionModalOpen(true);
  };

  useEffect(() => {
    if (quickAction === 'plan-session') {
      setActiveTab('schedule');
      openNewSessionModal(today);
      setQuickAction(null);
    }
  }, [quickAction]);

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessTitle.trim()) {
      setSessError('Please enter a session title or topic.');
      return;
    }
    if (!sessDate) {
      setSessError('Please pick a date.');
      return;
    }
    if (sessDuration < 15 || sessDuration > 480) {
      setSessError('Duration must be between 15 and 480 minutes.');
      return;
    }

    if (editingSessionId) {
      updateStudySession(editingSessionId, {
        subjectId: sessSubjectId,
        topicId: sessTopicId || undefined,
        title: sessTitle.trim(),
        date: sessDate,
        startTime: sessStartTime || '15:00',
        durationMinutes: Number(sessDuration),
      });
    } else {
      addStudySession({
        subjectId: sessSubjectId,
        topicId: sessTopicId || undefined,
        title: sessTitle.trim(),
        date: sessDate,
        startTime: sessStartTime || '15:00',
        durationMinutes: Number(sessDuration),
        completed: false,
        source: 'manual',
      });
    }
    setSessionModalOpen(false);
  };

  const openNewSubjectModal = () => {
    setEditingSubjectId(null);
    setSubjCode('');
    setSubjName('');
    setSubjInstructor('');
    setSubjExamDate('');
    setSubjColor(SUBJECT_COLORS[data.subjects.length % SUBJECT_COLORS.length]);
    setSubjError('');
    setSubjectModalOpen(true);
  };

  const openEditSubjectModal = (subj: Subject) => {
    setEditingSubjectId(subj.id);
    setSubjCode(subj.code);
    setSubjName(subj.name);
    setSubjInstructor(subj.instructor);
    setSubjExamDate(subj.examDate);
    setSubjColor(subj.color);
    setSubjError('');
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) {
      setSubjError('Subject name is required.');
      return;
    }
    if (editingSubjectId) {
      updateSubject(editingSubjectId, {
        code: subjCode.trim().toUpperCase(),
        name: subjName.trim(),
        instructor: subjInstructor.trim(),
        examDate: subjExamDate,
        color: subjColor,
      });
    } else {
      addSubject({
        code: subjCode.trim().toUpperCase(),
        name: subjName.trim(),
        instructor: subjInstructor.trim(),
        examDate: subjExamDate,
        color: subjColor,
      });
    }
    setSubjectModalOpen(false);
  };

  const handleAddTopic = (subjectId: string, e: React.FormEvent) => {
    e.preventDefault();
    const draft = topicDrafts[subjectId];
    if (!draft || !draft.title.trim()) return;
    addTopic({
      subjectId,
      chapter: draft.chapter.trim() || 'General',
      title: draft.title.trim(),
      estimatedHours: Math.max(0.5, Number(draft.hours) || 1.5),
      completed: false,
    });
    setTopicDrafts((prev) => ({
      ...prev,
      [subjectId]: { chapter: draft.chapter, title: '', hours: '1.5' },
    }));
  };

  const handleOpenSmartPlanner = () => {
    const preview = generateSmartStudyPlan({
      subjects: data.subjects,
      topics: data.topics,
      existingSessions: data.studySessions,
      preferences: data.preferences,
      horizonDays,
      replaceExistingSmartPlan: replaceSmartPlan,
    });
    setSmartPreview(preview);
    setSmartModalOpen(true);
  };

  const refreshSmartPreview = (nextHorizon: 7 | 14, nextReplace: boolean) => {
    setHorizonDays(nextHorizon);
    setReplaceSmartPlan(nextReplace);
    setSmartPreview(
      generateSmartStudyPlan({
        subjects: data.subjects,
        topics: data.topics,
        existingSessions: data.studySessions,
        preferences: data.preferences,
        horizonDays: nextHorizon,
        replaceExistingSmartPlan: nextReplace,
      }),
    );
  };

  const handleApplySmartPlan = () => {
    if (!smartPreview) return;
    applySmartPlanSessions(smartPreview.sessions, replaceSmartPlan);
    setSmartModalOpen(false);
    setActiveTab('schedule');
    setWeekOffset(0);
  };

  const topicsForSelectedSubject = useMemo(
    () => data.topics.filter((t) => t.subjectId === sessSubjectId),
    [data.topics, sessSubjectId],
  );

  return (
    <div className="max-w-[1280px] mx-auto space-y-5">
      {/* Top Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center p-1 bg-[#161719] border border-[#2A2C30] rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-[#222429] text-[#F2F2F2]'
                  : 'text-[#92959D] hover:text-[#F2F2F2]'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('subjects')}
              className={`px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'subjects'
                  ? 'bg-[#222429] text-[#F2F2F2]'
                  : 'text-[#92959D] hover:text-[#F2F2F2]'
              }`}
            >
              Subjects & Syllabus ({data.subjects.length})
            </button>
          </div>

          {/* Daily Goal Quick Input */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#161719] border border-[#2A2C30] text-[12px]">
            <span className="text-[#92959D]">Daily goal:</span>
            <select
              value={data.preferences.dailyStudyGoalHours}
              onChange={(e) =>
                updatePreferences({
                  dailyStudyGoalHours: Number(e.target.value),
                })
              }
              aria-label="Daily study goal hours"
              className="bg-transparent text-[#F2F2F2] font-mono tabular-nums focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                <option key={h} value={h} className="bg-[#1B1D20]">
                  {h}h / day
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenSmartPlanner}
            className="h-9 px-3.5 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#91A5D5]" />
            Smart Plan
          </button>

          <button
            type="button"
            onClick={openNewSubjectModal}
            className="h-9 px-3.5 rounded-md bg-[#161719] hover:bg-[#222429] border border-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#92959D]" />
            Add Subject
          </button>

          <button
            type="button"
            onClick={() => openNewSessionModal(today)}
            className="h-9 px-4 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[13px] font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </div>
      </div>

      {activeTab === 'schedule' ? (
        <div className="space-y-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between gap-4 bg-[#1B1D20] border border-[#2A2C30] rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#F2F2F2] tabular-nums">
              <Calendar className="w-4 h-4 text-[#91A5D5]" />
              <span>
                {formatShortDate(weekDates[0])} – {formatShortDate(weekDates[6])}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w - 1)}
                aria-label="Previous week"
                className="p-1.5 rounded bg-[#161719] border border-[#2A2C30] text-[#92959D] hover:text-[#F2F2F2]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="px-3 py-1 rounded bg-[#161719] border border-[#2A2C30] text-[12px] font-medium text-[#92959D] hover:text-[#F2F2F2]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w + 1)}
                aria-label="Next week"
                className="p-1.5 rounded bg-[#161719] border border-[#2A2C30] text-[#92959D] hover:text-[#F2F2F2]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 7-Day Weekly Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
            {weekDates.map((dateStr) => {
              const isToday = dateStr === today;
              const daySessions = data.studySessions
                .filter((s) => s.date === dateStr)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              const totalMinutes = daySessions.reduce(
                (acc, s) => acc + s.durationMinutes,
                0,
              );
              const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

              return (
                <div
                  key={dateStr}
                  className={`bg-[#1B1D20] border rounded-lg flex flex-col min-h-[240px] ${
                    isToday ? 'border-[#91A5D5]/60' : 'border-[#2A2C30]'
                  }`}
                >
                  {/* Day Header */}
                  <div className="px-3 py-2.5 border-b border-[#2A2C30] flex items-center justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[12px] font-semibold ${
                            isToday ? 'text-[#91A5D5]' : 'text-[#F2F2F2]'
                          }`}
                        >
                          {formatDayName(dateStr)}
                        </span>
                        <span className="text-[12px] text-[#92959D] tabular-nums">
                          {formatShortDate(dateStr)}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#92959D] tabular-nums mt-0.5">
                        {totalHours}h / {data.preferences.dailyStudyGoalHours}h
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openNewSessionModal(dateStr)}
                      aria-label={`Add study session on ${dateStr}`}
                      title="Add session"
                      className="p-1 rounded text-[#92959D] hover:text-[#F2F2F2] hover:bg-[#222429] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Sessions */}
                  <div className="p-2.5 flex-1 space-y-2">
                    {daySessions.length === 0 ? (
                      <div className="h-full flex items-center justify-center py-6">
                        <span className="text-[11px] text-[#92959D]/60">
                          Open day
                        </span>
                      </div>
                    ) : (
                      daySessions.map((sess) => {
                        const subj = subjectMap.get(sess.subjectId);
                        return (
                          <div
                            key={sess.id}
                            className={`p-2.5 rounded-md border transition-colors ${
                              sess.completed
                                ? 'bg-[#161719]/70 border-[#2A2C30]/70 opacity-75'
                                : 'bg-[#222429] border-[#2A2C30]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleStudySessionCompleted(sess.id)
                                }
                                aria-label={
                                  sess.completed
                                    ? 'Mark incomplete'
                                    : 'Mark completed'
                                }
                                className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                  sess.completed
                                    ? 'bg-[#5FA876]/20 border-[#5FA876] text-[#5FA876]'
                                    : 'border-[#92959D]/50 text-transparent hover:border-[#91A5D5]'
                                }`}
                              >
                                <Check className="w-2.5 h-2.5" />
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{
                                      backgroundColor: subj?.color || '#91A5D5',
                                    }}
                                  />
                                  <span className="text-[#91A5D5] truncate">
                                    {subj?.code || subj?.name || 'Study'}
                                  </span>
                                </div>
                                <div
                                  className={`mt-1 text-[12px] font-medium leading-snug ${
                                    sess.completed
                                      ? 'line-through text-[#92959D]'
                                      : 'text-[#F2F2F2]'
                                  }`}
                                >
                                  {sess.title}
                                </div>
                                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#92959D] tabular-nums">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span>{sess.durationMinutes}m</span>
                                  <span>· {sess.startTime}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-[#2A2C30] flex items-center justify-between">
                              <span className="text-[10px] text-[#92959D]/80">
                                {sess.source === 'smart-plan'
                                  ? 'Smart plan'
                                  : 'Manual'}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditSessionModal(sess)}
                                  aria-label={`Edit ${sess.title}`}
                                  className="p-1 text-[#92959D] hover:text-[#F2F2F2]"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteStudySession(sess.id)}
                                  aria-label={`Delete ${sess.title}`}
                                  className="p-1 text-[#92959D] hover:text-[#D06A6A]"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Subjects, Exams & Chapters/Topics Tab */
        <div className="space-y-4">
          {data.subjects.length === 0 ? (
            <div className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-10 text-center">
              <p className="text-[14px] text-[#F2F2F2] font-medium">
                No subjects added yet
              </p>
              <p className="text-[13px] text-[#92959D] mt-1">
                Add your courses, exam dates, and syllabus topics to enable smart scheduling.
              </p>
              <button
                type="button"
                onClick={openNewSubjectModal}
                className="mt-4 px-4 py-2 rounded-md bg-[#91A5D5] text-[#101113] text-[13px] font-medium"
              >
                Add First Subject
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.subjects.map((subject) => {
                const subjTopics = data.topics.filter(
                  (t) => t.subjectId === subject.id,
                );
                const completedTopics = subjTopics.filter(
                  (t) => t.completed,
                ).length;
                const daysToExam = subject.examDate
                  ? diffInDays(today, subject.examDate)
                  : null;
                const draft = topicDrafts[subject.id] || {
                  chapter: '',
                  title: '',
                  hours: '1.5',
                };

                return (
                  <div
                    key={subject.id}
                    className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: subject.color }}
                            />
                            <span className="text-[12px] font-mono text-[#91A5D5]">
                              {subject.code || 'COURSE'}
                            </span>
                            {subject.instructor && (
                              <>
                                <span className="text-[#92959D]/50">·</span>
                                <span className="text-[12px] text-[#92959D]">
                                  {subject.instructor}
                                </span>
                              </>
                            )}
                          </div>
                          <h3 className="mt-1 text-[16px] font-semibold text-[#F2F2F2]">
                            {subject.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditSubjectModal(subject)}
                            aria-label={`Edit ${subject.name}`}
                            className="p-1.5 rounded text-[#92959D] hover:text-[#F2F2F2] hover:bg-[#222429]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSubject(subject.id)}
                            aria-label={`Delete ${subject.name}`}
                            className="p-1.5 rounded text-[#92959D] hover:text-[#D06A6A] hover:bg-[#222429]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[#92959D] tabular-nums">
                        <span>
                          Exam:{' '}
                          {subject.examDate ? (
                            <span className="text-[#F2F2F2]">
                              {formatShortDate(subject.examDate)}{' '}
                              {daysToExam !== null && daysToExam >= 0
                                ? `(${daysToExam}d left)`
                                : '(Past)'}
                            </span>
                          ) : (
                            'Not set'
                          )}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Topics: {completedTopics} / {subjTopics.length} completed
                        </span>
                      </div>

                      {/* Topics List */}
                      <div className="mt-4 divide-y divide-[#2A2C30] border-t border-[#2A2C30]">
                        {subjTopics.length === 0 ? (
                          <p className="py-3 text-[12px] text-[#92959D]">
                            No chapters or topics added yet.
                          </p>
                        ) : (
                          subjTopics.map((topic) => (
                            <div
                              key={topic.id}
                              className="py-2.5 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateTopic(topic.id, {
                                      completed: !topic.completed,
                                    })
                                  }
                                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                    topic.completed
                                      ? 'bg-[#5FA876]/20 border-[#5FA876] text-[#5FA876]'
                                      : 'border-[#2A2C30] text-transparent hover:border-[#91A5D5]'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <div className="min-w-0">
                                  <div
                                    className={`text-[13px] ${
                                      topic.completed
                                        ? 'line-through text-[#92959D]'
                                        : 'text-[#F2F2F2]'
                                    }`}
                                  >
                                    {topic.title}
                                  </div>
                                  <div className="text-[11px] text-[#92959D] tabular-nums">
                                    {topic.chapter} · {topic.estimatedHours}h est.
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => deleteTopic(topic.id)}
                                aria-label={`Delete topic ${topic.title}`}
                                className="p-1 text-[#92959D] hover:text-[#D06A6A] shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Inline Add Topic Form */}
                    <form
                      onSubmit={(e) => handleAddTopic(subject.id, e)}
                      className="pt-3 border-t border-[#2A2C30] grid grid-cols-1 sm:grid-cols-12 gap-2"
                    >
                      <input
                        type="text"
                        value={draft.chapter}
                        onChange={(e) =>
                          setTopicDrafts((prev) => ({
                            ...prev,
                            [subject.id]: {
                              ...draft,
                              chapter: e.target.value,
                            },
                          }))
                        }
                        placeholder="Chapter"
                        className="sm:col-span-3 h-8 px-2.5 rounded bg-[#101113] border border-[#2A2C30] text-[12px] text-[#F2F2F2] placeholder:text-[#92959D]/60 focus:outline-none focus:border-[#91A5D5]"
                      />
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) =>
                          setTopicDrafts((prev) => ({
                            ...prev,
                            [subject.id]: { ...draft, title: e.target.value },
                          }))
                        }
                        placeholder="Add syllabus topic..."
                        className="sm:col-span-5 h-8 px-2.5 rounded bg-[#101113] border border-[#2A2C30] text-[12px] text-[#F2F2F2] placeholder:text-[#92959D]/60 focus:outline-none focus:border-[#91A5D5]"
                      />
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="12"
                        value={draft.hours}
                        onChange={(e) =>
                          setTopicDrafts((prev) => ({
                            ...prev,
                            [subject.id]: { ...draft, hours: e.target.value },
                          }))
                        }
                        aria-label="Estimated hours"
                        className="sm:col-span-2 h-8 px-2 rounded bg-[#101113] border border-[#2A2C30] text-[12px] text-[#F2F2F2] tabular-nums focus:outline-none focus:border-[#91A5D5]"
                      />
                      <button
                        type="submit"
                        className="sm:col-span-2 h-8 px-2.5 rounded bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[12px] font-medium text-[#F2F2F2] transition-colors whitespace-nowrap"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Study Session Modal */}
      <Modal
        open={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        title={editingSessionId ? 'Edit Study Session' : 'Plan Study Session'}
        subtitle="Schedule focused study time on your calendar."
      >
        <form onSubmit={handleSaveSession} className="space-y-4">
          {sessError && (
            <div className="px-3 py-2 rounded bg-[#D06A6A]/10 border border-[#D06A6A]/40 text-[12px] text-[#D06A6A]">
              {sessError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Subject
              </label>
              <select
                value={sessSubjectId}
                onChange={(e) => {
                  setSessSubjectId(e.target.value);
                  setSessTopicId('');
                }}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              >
                {data.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code ? `${s.code} · ${s.name}` : s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Linked Topic (Optional)
              </label>
              <select
                value={sessTopicId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSessTopicId(id);
                  const matched = topicsForSelectedSubject.find(
                    (t) => t.id === id,
                  );
                  if (matched && !sessTitle.trim()) {
                    setSessTitle(matched.title);
                  }
                }}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              >
                <option value="">None</option>
                {topicsForSelectedSubject.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
              Session Focus / Title *
            </label>
            <input
              type="text"
              value={sessTitle}
              onChange={(e) => setSessTitle(e.target.value)}
              placeholder="e.g. Dynamic Programming Problem Walkthrough"
              className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={sessDate}
                onChange={(e) => setSessDate(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={sessStartTime}
                onChange={(e) => setSessStartTime(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Duration (min)
              </label>
              <input
                type="number"
                min={15}
                max={480}
                step={15}
                value={sessDuration}
                onChange={(e) => setSessDuration(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] tabular-nums focus:outline-none focus:border-[#91A5D5]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setSessionModalOpen(false)}
              className="px-4 py-2 rounded-md bg-[#222429] hover:bg-[#2A2C30] text-[13px] font-medium text-[#F2F2F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[13px] font-medium"
            >
              {editingSessionId ? 'Save Changes' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Subject Modal */}
      <Modal
        open={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title={editingSubjectId ? 'Edit Subject' : 'Add Subject'}
        subtitle="Set course details and upcoming examination dates."
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          {subjError && (
            <div className="px-3 py-2 rounded bg-[#D06A6A]/10 border border-[#D06A6A]/40 text-[12px] text-[#D06A6A]">
              {subjError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Course Code
              </label>
              <input
                type="text"
                value={subjCode}
                onChange={(e) => setSubjCode(e.target.value)}
                placeholder="e.g. CS 301"
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Subject Name *
              </label>
              <input
                type="text"
                value={subjName}
                onChange={(e) => setSubjName(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Instructor
              </label>
              <input
                type="text"
                value={subjInstructor}
                onChange={(e) => setSubjInstructor(e.target.value)}
                placeholder="Prof. Name"
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Exam Date
              </label>
              <input
                type="date"
                value={subjExamDate}
                onChange={(e) => setSubjExamDate(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#92959D] mb-2">
              Chart Color Marker
            </label>
            <div className="flex items-center gap-2.5">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSubjColor(c)}
                  aria-label={`Select color ${c}`}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    subjColor === c
                      ? 'border-[#F2F2F2] scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setSubjectModalOpen(false)}
              className="px-4 py-2 rounded-md bg-[#222429] hover:bg-[#2A2C30] text-[13px] font-medium text-[#F2F2F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[13px] font-medium"
            >
              {editingSubjectId ? 'Save Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Rule-Based Smart Planner Modal */}
      <Modal
        open={smartModalOpen}
        onClose={() => setSmartModalOpen(false)}
        title="Rule-Based Smart Study Planner"
        subtitle="Automatically distributes pending syllabus topics by exam proximity while respecting your daily hour limit."
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Planning Horizon
              </label>
              <div className="inline-flex w-full p-1 bg-[#101113] border border-[#2A2C30] rounded-md">
                {([7, 14] as const).map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => refreshSmartPreview(days, replaceSmartPlan)}
                    className={`flex-1 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      horizonDays === days
                        ? 'bg-[#222429] text-[#F2F2F2]'
                        : 'text-[#92959D] hover:text-[#F2F2F2]'
                    }`}
                  >
                    Next {days} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 text-[12px] text-[#F2F2F2] cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={replaceSmartPlan}
                  onChange={(e) =>
                    refreshSmartPreview(horizonDays, e.target.checked)
                  }
                  className="rounded border-[#2A2C30] bg-[#101113] accent-[#91A5D5]"
                />
                Replace previous uncompleted auto-planned blocks
              </label>
            </div>
          </div>

          {smartPreview && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-md bg-[#161719] border border-[#2A2C30] flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <span className="text-[#92959D]">
                  Ready to schedule{' '}
                  <strong className="text-[#F2F2F2] tabular-nums">
                    {smartPreview.sessions.length} sessions
                  </strong>{' '}
                  ({smartPreview.totalHoursScheduled}h total)
                </span>
                <span className="text-[#92959D] tabular-nums">
                  Cap: {data.preferences.dailyStudyGoalHours}h/day ·{' '}
                  {data.preferences.focusBlockMinutes}m blocks
                </span>
              </div>

              {smartPreview.warnings.length > 0 && (
                <div className="p-3 rounded-md bg-[#D49A45]/10 border border-[#D49A45]/40 text-[12px] text-[#D49A45] space-y-1">
                  {smartPreview.warnings.map((w, i) => (
                    <p key={i}>{w}</p>
                  ))}
                </div>
              )}

              {smartPreview.sessions.length > 0 && (
                <div className="max-h-56 overflow-y-auto divide-y divide-[#2A2C30] border border-[#2A2C30] rounded-md bg-[#101113]">
                  {smartPreview.sessions.map((s) => {
                    const subj = subjectMap.get(s.subjectId);
                    return (
                      <div
                        key={s.id}
                        className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-[12px]"
                      >
                        <div className="min-w-0">
                          <div className="text-[#F2F2F2] font-medium truncate">
                            {s.title}
                          </div>
                          <div className="text-[#92959D] text-[11px]">
                            {subj?.code || subj?.name || 'Study'}
                          </div>
                        </div>
                        <div className="text-right shrink-0 text-[#92959D] tabular-nums">
                          <div>{formatShortDate(s.date)}</div>
                          <div className="text-[11px]">
                            {formatTimeRange(s.startTime, s.durationMinutes)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setSmartModalOpen(false)}
              className="px-4 py-2 rounded-md bg-[#222429] hover:bg-[#2A2C30] text-[13px] font-medium text-[#F2F2F2]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!smartPreview || smartPreview.sessions.length === 0}
              onClick={handleApplySmartPlan}
              className="px-4 py-2 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] disabled:opacity-40 disabled:cursor-not-allowed text-[#101113] text-[13px] font-medium"
            >
              Apply to Schedule
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
