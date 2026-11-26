import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CalendarPlus,
  Check,
  CheckCircle2,
  FilePlus2,
  PlusSquare,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  diffInDays,
  formatDayName,
  formatRelativeDue,
  formatShortDate,
  formatTimeRange,
  getGreeting,
  getTodayISO,
  getWeekDates,
} from '../../utils/dateUtils';

export const OverviewView: React.FC = () => {
  const {
    data,
    setActivePage,
    navigateWithAction,
    toggleStudySessionCompleted,
  } = useWorkspace();

  const today = getTodayISO();
  const firstName = data.profile.name.trim().split(/\s+/)[0] || 'Student';
  const greeting = getGreeting();

  const subjectMap = useMemo(() => {
    const map = new Map<string, (typeof data.subjects)[number]>();
    data.subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [data.subjects]);

  // Compact statistics
  const stats = useMemo(() => {
    const pendingCount = data.assignments.filter(
      (a) => a.status !== 'completed',
    ).length;
    const completedCount = data.assignments.filter(
      (a) => a.status === 'completed',
    ).length;

    const weekDates = new Set(
      getWeekDates(new Date(), data.preferences.weekStartsOn),
    );
    const weekCompletedMinutes = data.studySessions
      .filter((s) => s.completed && weekDates.has(s.date))
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    const studyHoursThisWeek =
      Math.round((weekCompletedMinutes / 60) * 10) / 10;

    const upcomingExamsCount = data.subjects.filter(
      (s) => s.examDate && s.examDate >= today,
    ).length;

    return {
      pendingCount,
      completedCount,
      studyHoursThisWeek,
      upcomingExamsCount,
    };
  }, [data.assignments, data.studySessions, data.subjects, data.preferences.weekStartsOn, today]);

  // Today's focus sessions
  const todaySessions = useMemo(() => {
    return data.studySessions
      .filter((s) => s.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [data.studySessions, today]);

  const activeFocusSession = useMemo(() => {
    return (
      todaySessions.find((s) => !s.completed) ||
      todaySessions[todaySessions.length - 1] ||
      null
    );
  }, [todaySessions]);

  const todayProgress = useMemo(() => {
    const totalMinutes = todaySessions.reduce(
      (sum, s) => sum + s.durationMinutes,
      0,
    );
    const completedMinutes = todaySessions
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    const pct =
      totalMinutes > 0
        ? Math.min(100, Math.round((completedMinutes / totalMinutes) * 100))
        : 0;
    return { totalMinutes, completedMinutes, pct };
  }, [todaySessions]);

  // Weekly Activity chart data
  const weeklyChartData = useMemo(() => {
    const weekDates = getWeekDates(new Date(), data.preferences.weekStartsOn);
    return weekDates.map((date) => {
      const daySessions = data.studySessions.filter((s) => s.date === date);
      const completedHours =
        Math.round(
          (daySessions
            .filter((s) => s.completed)
            .reduce((sum, s) => sum + s.durationMinutes, 0) /
            60) *
            10,
        ) / 10;
      const plannedHours =
        Math.round(
          (daySessions
            .filter((s) => !s.completed)
            .reduce((sum, s) => sum + s.durationMinutes, 0) /
            60) *
            10,
        ) / 10;
      return {
        day: formatDayName(date),
        date,
        completed: completedHours,
        planned: plannedHours,
        isToday: date === today,
      };
    });
  }, [data.studySessions, data.preferences.weekStartsOn, today]);

  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    return data.assignments
      .filter((a) => a.status !== 'completed')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
  }, [data.assignments]);

  // Nearest exam
  const nextExam = useMemo(() => {
    const upcoming = data.subjects
      .filter((s) => s.examDate && s.examDate >= today)
      .sort((a, b) => a.examDate.localeCompare(b.examDate));
    if (!upcoming[0]) return null;
    return {
      subject: upcoming[0],
      daysLeft: diffInDays(today, upcoming[0].examDate),
    };
  }, [data.subjects, today]);

  const activeSubject = activeFocusSession
    ? subjectMap.get(activeFocusSession.subjectId)
    : undefined;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Welcome Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-[#F2F2F2] text-balance">
            {greeting}, {firstName}.
          </h2>
          <p className="text-[14px] text-[#92959D] mt-1">
            Make room for focus.
          </p>
        </div>

        {nextExam && (
          <button
            type="button"
            onClick={() => setActivePage('planner')}
            className="self-start sm:self-auto text-left text-[12px] text-[#92959D] hover:text-[#F2F2F2] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <span>
              Next exam: <strong className="font-medium text-[#F2F2F2]">{nextExam.subject.code || nextExam.subject.name}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-[#91A5D5]">
              {nextExam.daysLeft === 0 ? 'Today' : `${nextExam.daysLeft}d left`}
            </span>
          </button>
        )}
      </section>

      {/* Four Compact Statistics */}
      <section
        aria-label="Academic Summary"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <div className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg px-4 py-3.5">
          <div className="text-[12px] text-[#92959D]">Pending assignments</div>
          <div className="mt-1.5 text-[24px] font-semibold text-[#F2F2F2] tabular-nums leading-none">
            {stats.pendingCount}
          </div>
        </div>

        <div className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg px-4 py-3.5">
          <div className="text-[12px] text-[#92959D]">Completed assignments</div>
          <div className="mt-1.5 text-[24px] font-semibold text-[#F2F2F2] tabular-nums leading-none">
            {stats.completedCount}
          </div>
        </div>

        <div className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg px-4 py-3.5">
          <div className="text-[12px] text-[#92959D]">Study hours this week</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[24px] font-semibold text-[#F2F2F2] tabular-nums leading-none">
              {stats.studyHoursThisWeek}h
            </span>
            <span className="text-[12px] text-[#92959D] tabular-nums">
              / {data.preferences.dailyStudyGoalHours * 7}h goal
            </span>
          </div>
        </div>

        <div className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg px-4 py-3.5">
          <div className="text-[12px] text-[#92959D]">Upcoming exams</div>
          <div className="mt-1.5 text-[24px] font-semibold text-[#F2F2F2] tabular-nums leading-none">
            {stats.upcomingExamsCount}
          </div>
        </div>
      </section>

      {/* Main Content Grid: Today's Focus + Weekly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Today's Focus (5 cols) */}
        <section className="lg:col-span-5 bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-[14px] font-semibold text-[#F2F2F2]">
                Today&apos;s Focus
              </h3>
              <button
                type="button"
                onClick={() => setActivePage('planner')}
                className="text-[12px] text-[#92959D] hover:text-[#F2F2F2] transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                Schedule <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeFocusSession ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-[12px] text-[#92959D]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: activeSubject?.color || '#91A5D5' }}
                    />
                    <span className="font-medium text-[#91A5D5]">
                      {activeSubject
                        ? `${activeSubject.code} · ${activeSubject.name}`
                        : 'General Study'}
                    </span>
                  </div>

                  <h4 className="mt-2 text-[16px] font-semibold text-[#F2F2F2] leading-snug">
                    {activeFocusSession.title}
                  </h4>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[#92959D] tabular-nums">
                    <span>{activeFocusSession.durationMinutes} min</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {formatTimeRange(
                        activeFocusSession.startTime,
                        activeFocusSession.durationMinutes,
                      )}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {activeFocusSession.completed ? 'Completed' : 'In progress'}
                    </span>
                  </div>
                </div>

                {/* Daily Completion Progress */}
                <div className="pt-2 border-t border-[#2A2C30]">
                  <div className="flex items-center justify-between text-[12px] mb-2">
                    <span className="text-[#92959D]">Today&apos;s progress</span>
                    <span className="font-mono tabular-nums text-[#F2F2F2]">
                      {todayProgress.completedMinutes} / {todayProgress.totalMinutes} min ({todayProgress.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#222429] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#91A5D5] transition-all duration-300"
                      style={{ width: `${todayProgress.pct}%` }}
                    />
                  </div>
                </div>

                {/* Other sessions today quick list if > 1 */}
                {todaySessions.length > 1 && (
                  <div className="pt-2 space-y-1.5">
                    <div className="text-[11px] font-medium text-[#92959D]">
                      Today&apos;s queue ({todaySessions.length})
                    </div>
                    {todaySessions.map((sess) => {
                      const sSubj = subjectMap.get(sess.subjectId);
                      return (
                        <button
                          key={sess.id}
                          type="button"
                          onClick={() => toggleStudySessionCompleted(sess.id)}
                          className="w-full flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-[#222429] transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                sess.completed
                                  ? 'bg-[#5FA876]/20 border-[#5FA876] text-[#5FA876]'
                                  : 'border-[#2A2C30] text-transparent hover:border-[#91A5D5]'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </span>
                            <span
                              className={`text-[12px] truncate ${
                                sess.completed
                                  ? 'line-through text-[#92959D]'
                                  : 'text-[#F2F2F2]'
                              }`}
                            >
                              {sess.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#92959D] tabular-nums shrink-0">
                            {sSubj?.code || ''} · {sess.durationMinutes}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-[13px] text-[#92959D]">
                  No study sessions planned for today yet.
                </p>
                <button
                  type="button"
                  onClick={() => navigateWithAction('planner', 'plan-session')}
                  className="mt-3 px-4 py-2 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[12px] font-medium text-[#F2F2F2] transition-colors whitespace-nowrap"
                >
                  Plan Study Session
                </button>
              </div>
            )}
          </div>

          {activeFocusSession && (
            <div className="mt-5 pt-4 border-t border-[#2A2C30] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  toggleStudySessionCompleted(activeFocusSession.id)
                }
                className={`w-full py-2 px-4 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeFocusSession.completed
                    ? 'bg-[#222429] text-[#5FA876] border border-[#5FA876]/40 hover:bg-[#2A2C30]'
                    : 'bg-[#91A5D5] text-[#101113] hover:bg-[#A3B5E0]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {activeFocusSession.completed
                  ? 'Completed (Click to Undo)'
                  : 'Mark Completed'}
              </button>
            </div>
          )}
        </section>

        {/* Weekly Activity (7 cols) */}
        <section className="lg:col-span-7 bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-[14px] font-semibold text-[#F2F2F2]">
                Weekly Activity
              </h3>
              <p className="text-[12px] text-[#92959D] mt-0.5">
                Completed vs. planned study hours against your {data.preferences.dailyStudyGoalHours}h daily target
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] text-[#92959D] shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#91A5D5]" />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2A2C30]" />
                Planned
              </span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyChartData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                barGap={2}
              >
                <CartesianGrid
                  stroke="#2A2C30"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#92959D', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#92959D', fontSize: 11 }}
                  unit="h"
                />
                <Tooltip
                  cursor={{ fill: '#222429', opacity: 0.6 }}
                  contentStyle={{
                    backgroundColor: '#161719',
                    borderColor: '#2A2C30',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#F2F2F2',
                  }}
                  formatter={(value, name) => [
                    `${value}h`,
                    name === 'completed' ? 'Completed' : 'Planned',
                  ]}
                />
                <ReferenceLine
                  y={data.preferences.dailyStudyGoalHours}
                  stroke="#92959D"
                  strokeDasharray="4 4"
                  strokeOpacity={0.45}
                />
                <Bar
                  dataKey="completed"
                  stackId="hours"
                  fill="#91A5D5"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="planned"
                  stackId="hours"
                  fill="#2A2C30"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Bottom Row: Upcoming Deadlines + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Upcoming Deadlines (8 cols) */}
        <section className="lg:col-span-8 bg-[#1B1D20] border border-[#2A2C30] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2A2C30] flex items-center justify-between gap-4">
            <h3 className="text-[14px] font-semibold text-[#F2F2F2]">
              Upcoming Deadlines
            </h3>
            <button
              type="button"
              onClick={() => setActivePage('assignments')}
              className="text-[12px] text-[#92959D] hover:text-[#F2F2F2] transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[13px] text-[#92959D]">
                All assignments are completed. Nice work.
              </p>
              <button
                type="button"
                onClick={() =>
                  navigateWithAction('assignments', 'add-assignment')
                }
                className="mt-3 px-4 py-2 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[12px] font-medium text-[#F2F2F2] transition-colors"
              >
                Add Assignment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#2A2C30]">
              {upcomingDeadlines.map((assignment) => {
                const subj = subjectMap.get(assignment.subjectId);
                const due = formatRelativeDue(assignment.dueDate, false);
                return (
                  <button
                    key={assignment.id}
                    type="button"
                    onClick={() => setActivePage('assignments')}
                    className="w-full px-5 py-3 flex items-center justify-between gap-4 hover:bg-[#222429]/60 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-[#F2F2F2] truncate">
                        {assignment.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[12px] text-[#92959D]">
                        <span className="truncate">
                          {subj ? `${subj.code} · ${subj.name}` : 'General'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            assignment.priority === 'high'
                              ? 'text-[#D49A45]'
                              : 'text-[#92959D]'
                          }
                        >
                          {assignment.priority.charAt(0).toUpperCase() +
                            assignment.priority.slice(1)}{' '}
                          priority
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[12px] tabular-nums">
                      {due.isOverdue && (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#D06A6A]" />
                      )}
                      <span
                        className={
                          due.isOverdue
                            ? 'text-[#D06A6A] font-medium'
                            : due.isUrgent
                              ? 'text-[#D49A45]'
                              : 'text-[#92959D]'
                        }
                      >
                        {due.label}
                      </span>
                      <span className="hidden sm:inline text-[#92959D]/60">
                        ({formatShortDate(assignment.dueDate)})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Actions (4 cols) */}
        <section className="lg:col-span-4 bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5">
          <h3 className="text-[14px] font-semibold text-[#F2F2F2] mb-3.5">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() =>
                navigateWithAction('assignments', 'add-assignment')
              }
              className="w-full px-3.5 py-2.5 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] flex items-center justify-between transition-colors whitespace-nowrap"
            >
              <span className="flex items-center gap-2.5">
                <PlusSquare className="w-4 h-4 text-[#91A5D5]" />
                Add Assignment
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#92959D]" />
            </button>

            <button
              type="button"
              onClick={() => navigateWithAction('notes', 'create-note')}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] flex items-center justify-between transition-colors whitespace-nowrap"
            >
              <span className="flex items-center gap-2.5">
                <FilePlus2 className="w-4 h-4 text-[#91A5D5]" />
                Create Note
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#92959D]" />
            </button>

            <button
              type="button"
              onClick={() => navigateWithAction('planner', 'plan-session')}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] flex items-center justify-between transition-colors whitespace-nowrap"
            >
              <span className="flex items-center gap-2.5">
                <CalendarPlus className="w-4 h-4 text-[#91A5D5]" />
                Plan Study Session
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#92959D]" />
            </button>

            <button
              type="button"
              onClick={() => navigateWithAction('quiz', 'generate-quiz')}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] flex items-center justify-between transition-colors whitespace-nowrap"
            >
              <span className="flex items-center gap-2.5">
                <BookOpenCheck className="w-4 h-4 text-[#91A5D5]" />
                Generate Quiz
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#92959D]" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
