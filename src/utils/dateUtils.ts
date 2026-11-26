export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseISODate(dateStr);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function diffInDays(fromDateStr: string, toDateStr: string): number {
  const from = parseISODate(fromDateStr);
  const to = parseISODate(toDateStr);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

export function getTodayISO(): string {
  return toISODate(new Date());
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatHeaderDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return 'No date';
  const d = parseISODate(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDue(dueDateStr: string, isCompleted = false): {
  label: string;
  isOverdue: boolean;
  isUrgent: boolean;
} {
  const today = getTodayISO();
  const delta = diffInDays(today, dueDateStr);

  if (isCompleted) {
    return {
      label: formatShortDate(dueDateStr),
      isOverdue: false,
      isUrgent: false,
    };
  }

  if (delta < 0) {
    const overdueDays = Math.abs(delta);
    return {
      label: `${overdueDays}d overdue`,
      isOverdue: true,
      isUrgent: true,
    };
  }
  if (delta === 0) {
    return { label: 'Due today', isOverdue: false, isUrgent: true };
  }
  if (delta === 1) {
    return { label: 'Due tomorrow', isOverdue: false, isUrgent: true };
  }
  if (delta <= 3) {
    return { label: `In ${delta} days`, isOverdue: false, isUrgent: true };
  }
  return {
    label: formatShortDate(dueDateStr),
    isOverdue: false,
    isUrgent: false,
  };
}

export function getWeekDates(
  referenceDate: Date = new Date(),
  weekStartsOn: 'monday' | 'sunday' = 'monday',
): string[] {
  const base = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  const day = base.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const diff =
    weekStartsOn === 'monday' ? (day === 0 ? -6 : 1 - day) : -day;
  base.setDate(base.getDate() + diff);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    dates.push(toISODate(d));
  }
  return dates;
}

export function formatDayName(dateStr: string): string {
  const d = parseISODate(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatTimeRange(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const startTotal = (h || 9) * 60 + (m || 0);
  const endTotal = startTotal + durationMinutes;
  const formatM = (total: number) => {
    const hh = Math.floor((total % (24 * 60)) / 60);
    const mm = total % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };
  return `${formatM(startTotal)} – ${formatM(endTotal)}`;
}

export function formatRelativeTimestamp(isoStr: string): string {
  const now = Date.now();
  const ts = new Date(isoStr).getTime();
  const diffMins = Math.max(0, Math.round((now - ts) / 60000));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
