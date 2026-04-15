export interface Book {
  title: string;
  author: string;
  coverUrl: string;
  key: string;
  /** Total pages when known (API or ISBN lookup); stack poster sums pageCount for each distinct book */
  pageCount?: number;
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
  { id: 'grid', label: 'Grid', description: '균일한 그리드 레이아웃' },
  {
    id: 'grid2',
    label: 'Grid 2',
    description: '무테 달력, 날짜·제목·표지 스택, 종이 질감 느낌',
  },
  { id: 'stack', label: 'Stack', description: '뉴스레터 스타일' },
  { id: 'list', label: 'List', description: '리스트 타이포그래피' },
  {
    id: 'essay',
    label: 'Essay',
    description: '영문 산문형 — In (월), I have read … / 제목+번호 / 마무리 문장',
  },
  { id: 'capsule', label: 'Capsule List', description: '상단 월·권수 제목, 캡슐 안에는 번호와 제목만' },
  { id: 'mosaic', label: 'Mosaic', description: '연도·월 없이 표지만, 책 개수에 맞는 컬러 그리드' },
  {
    id: 'timeline',
    label: 'Time-line Scatter',
    description: '굵은 디바이더와 세로 타임라인, 읽은 날짜에 점·지그재그 타이포',
  },
];
