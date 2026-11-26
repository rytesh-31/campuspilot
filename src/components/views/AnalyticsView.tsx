import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  formatDayName,
  formatRelativeTimestamp,
  getWeekDates,
} from '../../utils/dateUtils';

export const AnalyticsView: React.FC = () => {
  const { data } = useWorkspace();

  const metrics = useMemo(() => {
    const completedSessions = data.studySessions.filter((s) => s.completed);
    const totalMinutes = completedSessions.reduce(
      (sum, s) => sum + s.durationMinutes,
      0,
    );
    const totalStudyHours = Math.round((totalMinutes / 60) * 10) / 10;

    const totalAssignments = data.assignments.length;
    const completedAssignments = data.assignments.filter(
      (a) => a.status === 'completed',
    ).length;
    const assignmentPct =
      totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

    const totalQuizQuestions = data.quizAttempts.reduce(
      (sum, q) => sum + q.totalQuestions,
      0,
    );
    const totalQuizCorrect = data.quizAttempts.reduce(
      (sum, q) => sum + q.score,
      0,
    );
    const avgQuizPct =
      totalQuizQuestions > 0
        ? Math.round((totalQuizCorrect / totalQuizQuestions) * 100)
        : null;

    return {
      totalStudyHours,
      completedSessionsCount: completedSessions.length,
      totalSessionsCount: data.studySessions.length,
      assignmentPct,
      completedAssignments,
      totalAssignments,
      avgQuizPct,
    };
  }, [data.studySessions, data.assignments, data.quizAttempts]);

  // Weekly study activity (current week Mon–Sun)
  const weeklyActivityData = useMemo(() => {
    const weekDates = getWeekDates(new Date(), data.preferences.weekStartsOn);
    return weekDates.map((date) => {
      const completedMins = data.studySessions
        .filter((s) => s.date === date && s.completed)
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      const plannedMins = data.studySessions
        .filter((s) => s.date === date && !s.completed)
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      return {
        day: formatDayName(date),
        completed: Math.round((completedMins / 60) * 10) / 10,
        planned: Math.round((plannedMins / 60) * 10) / 10,
      };
    });
  }, [data.studySessions, data.preferences.weekStartsOn]);

  // Subject-wise study distribution
  const subjectDistribution = useMemo(() => {
    const completedMinutesBySubject = new Map<string, number>();
    data.studySessions
      .filter((s) => s.completed)
      .forEach((s) => {
        completedMinutesBySubject.set(
          s.subjectId,
          (completedMinutesBySubject.get(s.subjectId) || 0) + s.durationMinutes,
        );
      });

    const totalMins = Array.from(completedMinutesBySubject.values()).reduce(
      (a, b) => a + b,
      0,
    );

    return data.subjects
      .map((subj) => {
        const mins = completedMinutesBySubject.get(subj.id) || 0;
        const hours = Math.round((mins / 60) * 10) / 10;
        const pct = totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0;
        return {
          id: subj.id,
          label: subj.code || subj.name,
          fullName: subj.name,
          hours,
          pct,
          color: subj.color,
        };
      })
      .sort((a, b) => b.hours - a.hours);
  }, [data.subjects, data.studySessions]);

  const assignmentBreakdown = useMemo(() => {
    return {
      pending: data.assignments.filter((a) => a.status === 'pending').length,
      inProgress: data.assignments.filter((a) => a.status === 'in-progress')
        .length,
      completed: data.assignments.filter((a) => a.status === 'completed')
        .length,
    };
  }, [data.assignments]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Top KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg px-4 py-3.5">
          <div className="text-[12px] text-[#92959D]">Total study hours</div>
          <div className="mt-1.5 text-[24px] font-semibold text-[#F2F2F2] tabular-nums leading-none">
            {metrics.totalStudyHours}h
          </div>
        </div>

        <div className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg px-4 py-3.5">
          <div className="text-[12px] text-[#92959D]">Completed sessions</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[24px] font-semibold text-[#F2F2F2] tabular-nums leading-none">
              {metrics.completedSessionsCount}
            </span>
            <span className="text-[12px] text-[#92959D] tabular-nums">
              / {metrics.totalSessionsCount} total
            </span>
          </div>
        </div>

        <div className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg px-4 py-3.5">
          <div className="text-[12px] text-[#92959D]">Assignment completion</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[24px] font-semibold text-[#F2F2F2] tabular-nums leading-none">
              {metrics.assignmentPct}%
            </span>
            <span className="text-[12px] text-[#92959D] tabular-nums">
              ({metrics.completedAssignments}/{metrics.totalAssignments})
            </span>
          </div>
        </div>

        <div className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg px-4 py-3.5">
          <div className="text-[12px] text-[#92959D]">Quiz accuracy</div>
          <div className="mt-1.5 text-[24px] font-semibold text-[#F2F2F2] tabular-nums leading-none">
            {metrics.avgQuizPct !== null ? `${metrics.avgQuizPct}%` : '—'}
          </div>
        </div>
      </section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Weekly Study Activity */}
        <section className="lg:col-span-7 bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5">
          <div className="mb-4">
            <h3 className="text-[14px] font-semibold text-[#F2F2F2]">
              Weekly Study Activity
            </h3>
            <p className="text-[12px] text-[#92959D] mt-0.5">
              Completed and scheduled study hours across the current week
            </p>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyActivityData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
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
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill="#91A5D5"
                  maxBarSize={28}
                />
                <Bar
                  dataKey="planned"
                  stackId="a"
                  fill="#2A2C30"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Subject-Wise Study Distribution */}
        <section className="lg:col-span-5 bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[#F2F2F2]">
              Subject Distribution
            </h3>
            <p className="text-[12px] text-[#92959D] mt-0.5">
              Completed hours logged by course
            </p>
          </div>

          {subjectDistribution.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-[#92959D]">
              Add subjects and complete study sessions to see subject distribution.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subjectDistribution}
                    layout="vertical"
                    margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#92959D', fontSize: 11 }}
                      unit="h"
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      width={72}
                      tick={{ fill: '#F2F2F2', fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#222429', opacity: 0.5 }}
                      contentStyle={{
                        backgroundColor: '#161719',
                        borderColor: '#2A2C30',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#F2F2F2',
                      }}
                      formatter={(val) => [`${val}h`, 'Completed']}
                    />
                    <Bar dataKey="hours" radius={[0, 4, 4, 0]} maxBarSize={18}>
                      {subjectDistribution.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="divide-y divide-[#2A2C30] border-t border-[#2A2C30]">
                {subjectDistribution.map((row) => (
                  <div
                    key={row.id}
                    className="py-2 flex items-center justify-between text-[12px]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="text-[#F2F2F2] truncate">
                        {row.fullName}
                      </span>
                    </div>
                    <span className="text-[#92959D] font-mono tabular-nums shrink-0 ml-2">
                      {row.hours}h ({row.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Bottom Row: Assignment Pipeline + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-5 bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5">
          <h3 className="text-[14px] font-semibold text-[#F2F2F2]">
            Assignment Breakdown
          </h3>
          <p className="text-[12px] text-[#92959D] mt-0.5 mb-4">
            Current distribution across workflow stages
          </p>

          <div className="space-y-3.5">
            {[
              {
                label: 'Completed',
                count: assignmentBreakdown.completed,
                color: '#5FA876',
              },
              {
                label: 'In Progress',
                count: assignmentBreakdown.inProgress,
                color: '#91A5D5',
              },
              {
                label: 'Pending',
                count: assignmentBreakdown.pending,
                color: '#D49A45',
              },
            ].map((item) => {
              const pct =
                metrics.totalAssignments > 0
                  ? Math.round((item.count / metrics.totalAssignments) * 100)
                  : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#F2F2F2]">{item.label}</span>
                    <span className="text-[#92959D] tabular-nums">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#222429] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-7 bg-[#1B1D20] border border-[#2A2C30] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2A2C30]">
            <h3 className="text-[14px] font-semibold text-[#F2F2F2]">
              Recent Activity
            </h3>
          </div>

          {data.activityLog.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-[#92959D]">
              No activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-[#2A2C30] max-h-64 overflow-y-auto">
              {data.activityLog.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="px-5 py-3 flex items-center justify-between gap-4 text-[13px]"
                >
                  <span className="text-[#F2F2F2] truncate">
                    {entry.description}
                  </span>
                  <span className="text-[12px] text-[#92959D] tabular-nums shrink-0">
                    {formatRelativeTimestamp(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
