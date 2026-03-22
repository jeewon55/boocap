import { useState } from 'react';
import { Book } from '@/types/book';
import { BookSearchModal } from '@/components/BookSearchModal';
import { MonthSelector } from '@/components/MonthSelector';
import { X, ArrowRight } from 'lucide-react';

const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

interface Step1Props {
  year: number;
  month: number;
  entries: Record<number, Book>;
  onMonthChange: (y: number, m: number) => void;
  onAddBook: (day: number, book: Book) => void;
  onRemoveBook: (day: number) => void;
  onNext: () => void;
}

export function Step1AddBooks({ year, month, entries, onMonthChange, onAddBook, onRemoveBook, onNext }: Step1Props) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const bookCount = Object.keys(entries).length;

  return (
    <div className="flex-1 flex flex-col px-6">
      <div className="flex-1 max-w-md mx-auto w-full pt-2">
        <MonthSelector year={year} month={month} onChange={onMonthChange} />

        <p className="text-xs text-muted-foreground font-body mt-3 mb-4">
          날짜를 눌러 읽은 책을 추가하세요 · {bookCount}권 추가됨
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
                className="relative aspect-[3/4] flex items-center justify-center border border-border hover:bg-secondary/50 transition-colors group rounded-sm overflow-hidden"
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

      <div className="py-6 max-w-md mx-auto w-full">
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background text-xs font-body tracking-[0.15em] uppercase hover:opacity-90 transition-opacity"
        >
          Choose Template
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* View existing book detail */}
      {selectedDay !== null && entries[selectedDay] && !isReplacing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedDay(null)}>
          <div
            className="bg-background border border-border w-full sm:max-w-md sm:mx-4 rounded-t-2xl sm:rounded-lg animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <span className="font-display text-sm tracking-[0.2em] text-muted-foreground">
                {MONTHS[month]} {selectedDay}
              </span>
              <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-secondary transition-colors rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col items-center gap-4">
              <img
                src={entries[selectedDay].coverUrl}
                alt={entries[selectedDay].title}
                className="w-28 h-40 object-cover shadow-lg"
              />
              <div className="text-center">
                <p className="text-sm font-medium font-body">{entries[selectedDay].title}</p>
                {entries[selectedDay].author && (
                  <p className="text-xs text-muted-foreground font-body mt-1">{entries[selectedDay].author}</p>
                )}
              </div>
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={() => { onRemoveBook(selectedDay); setSelectedDay(null); }}
                className="flex-1 py-3 border border-border text-xs font-body tracking-[0.15em] uppercase hover:bg-secondary transition-colors"
              >
                삭제
              </button>
              <button
                onClick={() => setIsReplacing(true)}
                className="flex-1 py-3 bg-foreground text-background text-xs font-body tracking-[0.15em] uppercase hover:opacity-90 transition-opacity"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add new book or replace existing */}
      {selectedDay !== null && (!entries[selectedDay] || isReplacing) && (
        <BookSearchModal
          day={selectedDay}
          month={month}
          onSelect={(book) => {
            onAddBook(selectedDay, book);
            setSelectedDay(null);
            setIsReplacing(false);
          }}
          onClose={() => { setSelectedDay(null); setIsReplacing(false); }}
        />
      )}
    </div>
  );
}
