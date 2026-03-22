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

export type TemplateType = 'grid' | 'stack' | 'collage' | 'list' | 'spine' | 'calendar' | 'typography' | 'archive';

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
  { id: 'stack', label: 'Stack', description: '겹쳐진 카드 스타일' },
  { id: 'collage', label: 'Collage', description: '자유로운 콜라주 배치' },
  { id: 'list', label: 'List', description: '리스트 타이포그래피' },
  { id: 'spine', label: 'Spine Stack', description: '책등을 쌓은 통계형' },
  { id: 'calendar', label: 'Insight Calendar', description: '잔디형 독서 캘린더' },
  { id: 'typography', label: 'Typography', description: '텍스트만으로 구성된 포스터' },
  { id: 'archive', label: 'Minimal Archive', description: '미니멀 아카이브 리스트' },
];
