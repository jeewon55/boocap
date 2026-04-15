import { Book } from '@/types/book';
import { X } from 'lucide-react';

const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

interface BookCalendarProps {
  year: number;
  month: number;
  entries: Record<number, Book>;
  onDayClick: (day: number) => void;
  onRemove: (day: number) => void;
}

export function BookCalendar({ year, month, entries, onDayClick, onRemove }: BookCalendarProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="py-4">
      <div className="grid grid-cols-7 gap-px mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] tracking-[0.15em] text-muted-foreground font-body py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map((day) => {
          const book = entries[day];
          return (
            <button
              key={day}
              onClick={() => onDayClick(day)}
              className="group relative flex aspect-square items-center justify-center rounded-none border border-border transition-colors hover:bg-secondary"
            >
              {book ? (
                <>
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute top-0 right-0 p-0.5 bg-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onRemove(day); }}
                  >
                    <X className="w-2.5 h-2.5 text-background" />
                  </div>
                </>
              ) : (
                <span className="text-xs text-muted-foreground font-body">{day}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
