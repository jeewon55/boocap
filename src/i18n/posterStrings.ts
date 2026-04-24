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

/** Grid2 (borderless calendar): first line month — always English full name */
export function posterGrid2MonthLine(monthIndex: number): string {
  return MONTH_EN_FULL[monthIndex];
}

/** Grid2 (borderless calendar): second line under month — fixed label in all locales */
export function posterGrid2Subtitle(): string {
  return 'Reading Journey';
}

/** Timeline vertical rail (rotated) */
export function posterTimelineVerticalLabel(locale: Locale, monthIndex: number, year: number): string {
  if (locale === 'ko') {
    return `${year}년 ${MONTH_KO_SHORT[monthIndex]}월`;
  }
  return `${MONTH_EN_FULL[monthIndex]}, ${year}`;
}
