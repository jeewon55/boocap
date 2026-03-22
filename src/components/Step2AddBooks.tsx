import { useState } from 'react';
import { Book } from '@/types/book';
import { BookEntryModal } from '@/components/BookEntryModal';
import { BookSearchModal } from '@/components/BookSearchModal';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

interface Step2Props {
  year: number;
  month: number;
  entries: Record<number, Book>;
  onAddBook: (day: number, book: Book) => void;
  onRemoveBook: (day: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step2AddBooks({ year, month, entries, onAddBook, onRemoveBook, onBack, onNext }: Step2Props) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const bookCount = Object.keys(entries).length;

  return (
    <div className="flex-1 flex flex-col px-6">
      <div className="flex-1 max-w-md mx-auto w-full pt-2">
        <p className="text-[10px] tracking-[0.3em] text-muted-foreground font-body uppercase mb-2">Step 2</p>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-1">
          책을 추가하세요
        </h2>
        <p className="text-xs text-muted-foreground font-body mb-4">
          {MONTHS[month]} {year} · {bookCount}권 추가됨
        </p>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[9px] tracking-[0.15em] text-muted-foreground font-body py-1.5">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => <div key={`b${i}`} />)}
          {days.map((day) => {
            const book = entries[day];
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className="relative aspect-square flex items-center justify-center border border-border hover:bg-secondary/50 transition-colors group rounded-sm overflow-hidden"
              >
                {book ? (
                  <>
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute top-0 right-0 p-0.5 bg-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-bl-sm"
                      onClick={(e) => { e.stopPropagation(); onRemoveBook(day); }}
                    >
                      <X className="w-2.5 h-2.5 text-background" />
                    </div>
                  </>
                ) : (
                  <span className="text-[11px] text-muted-foreground font-body">{day}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="py-6 max-w-md mx-auto w-full flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 py-4 border border-border text-xs font-body tracking-[0.15em] uppercase hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] flex items-center justify-center gap-2 py-4 bg-foreground text-background text-xs font-body tracking-[0.15em] uppercase hover:opacity-90 transition-opacity"
        >
          Choose Template
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {selectedDay !== null && (
        <BookEntryModal
          day={selectedDay}
          month={month}
          onConfirm={(book) => {
            onAddBook(selectedDay, book);
            setSelectedDay(null);
          }}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
