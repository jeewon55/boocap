import type { Locale } from '@/contexts/LocaleContext';

const MONTH_EN_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MONTH_KO_SHORT = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;

/** List template: “December 2025” vs compact Korean month line */
export function posterListHeaderMonthYear(locale: Locale, monthIndex: number, year: number): string {
  if (locale === 'ko') {
    return `${year}년 ${MONTH_KO_SHORT[monthIndex]}월`;
  }
  const m = MONTH_EN_FULL[monthIndex];
  return `${m} ${year}`;
}

/** Grid2: first line month only — “March” / “3월” */
export function posterGrid2MonthLine(locale: Locale, monthIndex: number): string {
  if (locale === 'ko') {
    return `${MONTH_KO_SHORT[monthIndex]}월`;
  }
  return MONTH_EN_FULL[monthIndex];
}

/** Grid2: second line under month */
export function posterGrid2Subtitle(locale: Locale): string {
  return locale === 'ko' ? '독서 여정' : 'Reading Journey';
}

/** Timeline vertical rail (rotated) */
export function posterTimelineVerticalLabel(locale: Locale, monthIndex: number, year: number): string {
  if (locale === 'ko') {
    return `${year}년 ${MONTH_KO_SHORT[monthIndex]}월`;
  }
  return `${MONTH_EN_FULL[monthIndex]}, ${year}`;
}
