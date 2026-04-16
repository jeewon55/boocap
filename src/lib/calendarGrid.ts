/** Monday-first single-letter row (Sat / Sun both “S”). */
export const WEEK_LETTERS_MON: { letter: string; title: string }[] = [
  { letter: 'M', title: 'Monday' },
  { letter: 'T', title: 'Tuesday' },
  { letter: 'W', title: 'Wednesday' },
  { letter: 'T', title: 'Thursday' },
  { letter: 'F', title: 'Friday' },
  { letter: 'S', title: 'Saturday' },
  { letter: 'S', title: 'Sunday' },
];

export type CalendarGridCell =
  | { scope: 'current'; day: number }
  | { scope: 'adjacent'; day: number; which: 'prev' | 'next' };

export function twoDigitDay(n: number): string {
  if (!Number.isFinite(n) || n < 1 || n > 31) return '  ';
  return String(Math.trunc(n)).padStart(2, '0');
}

/** Monday-first weeks; leading/trailing cells are adjacent months. */
export function buildCalendarWeekRows(year: number, month: number): CalendarGridCell[][] {
  const y = Number(year);
  const m = Number(month);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return [];

  const firstDaySun0 = new Date(y, m, 1).getDay();
  const leadBlanks = (firstDaySun0 + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevMonthLast = new Date(y, m, 0).getDate();

  const leading: CalendarGridCell[] = [];
  for (let i = 0; i < leadBlanks; i++) {
    leading.push({
      scope: 'adjacent',
      which: 'prev',
      day: prevMonthLast - leadBlanks + 1 + i,
    });
  }

  const current: CalendarGridCell[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    current.push({ scope: 'current', day: d });
  }

  const gridDays: CalendarGridCell[] = [...leading, ...current];
  let nextTrail = 1;
  while (gridDays.length % 7 !== 0) {
    gridDays.push({ scope: 'adjacent', which: 'next', day: nextTrail++ });
  }

  const weekRows: CalendarGridCell[][] = [];
  for (let i = 0; i < gridDays.length; i += 7) {
    weekRows.push(gridDays.slice(i, i + 7));
  }
  return weekRows;
}
