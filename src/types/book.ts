/** Max distinct books per month in the create flow (UI + poster limits assume this cap). */
export const MAX_BOOKS_PER_MONTH = 12;

export interface Book {
  title: string;
  author: string;
  coverUrl: string;
  key: string;
}

export interface DayEntry {
  day: number;
  book: Book | null;
}

export type MoodType = 'minimal' | 'editorial' | 'bold' | 'dark';

export type TemplateType =
  | 'grid'
  | 'grid2'
  | 'stack'
  | 'list'
  | 'essay'
  | 'capsule'
  | 'mosaic'
  | 'timeline';

export interface MoodConfig {
  id: MoodType;
  label: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
}

export interface TemplateConfig {
  id: TemplateType;
  label: string;
  description: string;
}

export const MOODS: MoodConfig[] = [
  { id: 'minimal', label: 'Minimal', bgColor: '#F9F9F7', textColor: '#1A1A1A', accentColor: '#E5E5E1' },
  { id: 'editorial', label: 'Editorial', bgColor: '#FFFEF5', textColor: '#2C2C2C', accentColor: '#C8B88A' },
  { id: 'bold', label: 'Bold', bgColor: '#1A1A1A', textColor: '#F9F9F7', accentColor: '#FF4D00' },
  { id: 'dark', label: 'Dark', bgColor: '#0D0D0D', textColor: '#E8E8E8', accentColor: '#6B6B6B' },
];

export const TEMPLATES: TemplateConfig[] = [
  { id: 'grid', label: 'Monthly Calendar', description: '균일한 그리드 레이아웃' },
  {
    id: 'grid2',
    label: 'Borderless Calendar',
    description: '무테 달력, 날짜·제목·표지 스택, 종이 질감 느낌',
  },
  { id: 'list', label: 'The Receipt', description: '리스트 타이포그래피' },
  {
    id: 'essay',
    label: 'The Typo Slash',
    description: '영문 산문형 — In (월), I have read … / 제목+번호 / 마무리 문장',
  },
  { id: 'stack', label: 'Big Cover', description: '뉴스레터 스타일' },
  { id: 'capsule', label: 'Book Edge', description: '상단 월·권수 제목, 캡슐 안에는 번호와 제목만' },
  { id: 'mosaic', label: 'Floating Cover', description: '연도·월 없이 표지만, 책 개수에 맞는 컬러 그리드' },
  {
    id: 'timeline',
    label: 'Timeline',
    description: '굵은 디바이더와 세로 타임라인, 읽은 날짜에 점·지그재그 타이포',
  },
];

/** Distinct books in the month (one per day slot). Assumes ≥1 in normal flow. */
export function countBooksInEntries(entries: Record<number, Book | undefined>): number {
  return Object.values(entries).filter(Boolean).length;
}

/**
 * Which templates appear for a given book count (max 12).
 * - grid, grid2, stack: always
 * - list: ≤9
 * - essay: ≤5
 * - capsule: 4–8
 * - mosaic: 9 books; even counts ≥2 except 10 (2,4,6,8,12)
 * - timeline: ≥3
 */
export function isTemplateVisibleForBookCount(templateId: TemplateType, bookCount: number): boolean {
  const n = bookCount;
  if (n < 1) return true;
  switch (templateId) {
    case 'grid':
    case 'grid2':
    case 'stack':
      return true;
    case 'list':
      return n <= 9;
    case 'essay':
      return n <= 5;
    case 'capsule':
      return n >= 4 && n <= 8;
    case 'mosaic':
      if (n === 10) return false;
      if (n === 9) return true;
      return n >= 2 && n % 2 === 0;
    case 'timeline':
      return n >= 3;
    default:
      return true;
  }
}

export function visibleTemplatesForBookCount(bookCount: number): TemplateConfig[] {
  return TEMPLATES.filter((t) => isTemplateVisibleForBookCount(t.id, bookCount));
}

export function firstVisibleTemplateForBookCount(bookCount: number): TemplateType {
  const list = visibleTemplatesForBookCount(bookCount);
  return list[0]?.id ?? 'grid';
}
