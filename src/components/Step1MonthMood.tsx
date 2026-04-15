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
    <div className="flex flex-1 flex-col px-6">
      <div className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center">
        <div className="text-center">
          <p className="mb-2 font-display text-[10px] uppercase tracking-[0] text-muted-foreground">Step 1</p>
          <h2 className="mt-2 mb-8 font-display text-[20px] font-extrabold leading-none tracking-[0] text-[#d6d6d6]">
            월과 무드를<br />선택하세요
          </h2>
        </div>

        <MonthSelector year={year} month={month} onChange={onMonthChange} />
        <div className="mt-6">
          <MoodSelector selected={mood} onChange={onMoodChange} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[26rem] py-6">
        <button
          onClick={onNext}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-foreground py-4 text-xs font-body font-medium tracking-normal text-background transition-opacity hover:opacity-90"
        >
          Add Books
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
