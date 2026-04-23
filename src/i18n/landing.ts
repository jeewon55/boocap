import type { Locale } from '@/contexts/LocaleContext';

/** 한글 문구는 여기만 수정하면 됩니다. */
export const landingMessages: Record<
  Locale,
  {
    /** 두 줄 히어로(예: ko). null이면 heroLine1 + accent + line2 사용 */
    heroSingleLines: readonly [string, string] | null;
    heroLine1: string;
    heroAccent: string;
    heroLine2: string;
    subhead: string;
    /** 두 번째 서브 문단. null이면 subhead만 */
    subheadSecond: string | null;
    createRecap: string;
    monthlyRecap: string;
    booksLabel: string;
    monthPickerLabels: string[];
  }
> = {
  en: {
    heroSingleLines: ['Frame your monthly journey', 'into a single archive.'] as const,
    heroLine1: '',
    heroAccent: '',
    heroLine2: '',
    subhead: 'Turn your monthly readings',
    subheadSecond: 'into a clean grid-based poster.',
    createRecap: 'Create Recap',
    monthlyRecap: 'Monthly recap',
    booksLabel: 'Books',
    monthPickerLabels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
  },
  ko: {
    heroSingleLines: ['한 달의 독서 여정을', '정돈된 한 장의 기록으로.'] as const,
    heroLine1: '',
    heroAccent: '',
    heroLine2: '',
    subhead: '흩어진 독서의 흔적들을 모아',
    subheadSecond: '나만의 포스터를 완성해 보세요.',
    createRecap: '포스터 만들기',
    monthlyRecap: '월간 리캡',
    booksLabel: '권',
    monthPickerLabels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  },
};

export function formatMonthYear(locale: Locale, monthIndex: number, year: number, monthNamesEn: string[]) {
  if (locale === 'ko') {
    return `${year}년 ${monthIndex + 1}월`;
  }
  return `${monthNamesEn[monthIndex]} ${year}`;
}
