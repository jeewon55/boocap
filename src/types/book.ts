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

export interface MoodConfig {
  id: MoodType;
  label: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
}

export const MOODS: MoodConfig[] = [
  { id: 'minimal', label: 'Minimal', bgColor: '#F9F9F7', textColor: '#1A1A1A', accentColor: '#E5E5E1' },
  { id: 'editorial', label: 'Editorial', bgColor: '#FFFEF5', textColor: '#2C2C2C', accentColor: '#C8B88A' },
  { id: 'bold', label: 'Bold', bgColor: '#1A1A1A', textColor: '#F9F9F7', accentColor: '#FF4D00' },
  { id: 'dark', label: 'Dark', bgColor: '#0D0D0D', textColor: '#E8E8E8', accentColor: '#6B6B6B' },
];
