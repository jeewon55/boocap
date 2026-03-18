import { MonthSelector } from '@/components/MonthSelector';
import { MoodSelector } from '@/components/MoodSelector';
import { MoodType } from '@/types/book';
import { ArrowRight } from 'lucide-react';

interface Step1Props {
  year: number;
  month: number;
  mood: MoodType;
  onMonthChange: (y: number, m: number) => void;
  onMoodChange: (m: MoodType) => void;
  onNext: () => void;
}

export function Step1MonthMood({ year, month, mood, onMonthChange, onMoodChange, onNext }: Step1Props) {
  return (
    <div className="flex-1 flex flex-col px-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <p className="text-[10px] tracking-[0.3em] text-muted-foreground font-body uppercase mb-2">Step 1</p>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-8">
          월과 무드를<br />선택하세요
        </h2>

        <MonthSelector year={year} month={month} onChange={onMonthChange} />
        <div className="mt-6">
          <MoodSelector selected={mood} onChange={onMoodChange} />
        </div>
      </div>

      <div className="py-6 max-w-md mx-auto w-full">
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background text-xs font-body tracking-[0.15em] uppercase hover:opacity-90 transition-opacity"
        >
          Add Books
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
