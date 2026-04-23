import { useState } from 'react';
import { Book } from '@/types/book';
import { BookEntryModal } from '@/components/BookEntryModal';
import { BookSearchModal } from '@/components/BookSearchModal';
import { BottomSheetKeyboardLift } from '@/components/BottomSheetKeyboardLift';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { createFlowMessages } from '@/i18n/createFlow';

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
  const { locale } = useLocale();
  const flow = createFlowMessages[locale];
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const bookCount = Object.keys(entries).length;

  return (
    <div className="flex flex-1 flex-col px-4 sm:px-6">
      <div className="mx-auto w-full max-w-[26rem] flex-1 pt-2">
        <div className="text-center">
          <p className="mb-2 font-display text-[10px] uppercase tracking-[0] text-muted-foreground">Step 2</p>
          <h2 className="mt-2 mb-1 font-display text-[20px] font-extrabold leading-none tracking-[0] text-[#d6d6d6]">
            책을 추가하세요
          </h2>
          <p className="text-xs text-muted-foreground font-body mb-4">
            {MONTHS[month]} {year} · {bookCount}권 추가됨
          </p>
        </div>

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
                className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-none border border-border transition-colors hover:bg-secondary/50"
              >
                {book ? (
                  <>
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute right-0 top-0 cursor-pointer rounded-bl-md bg-foreground/70 p-1 opacity-100 transition-opacity group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); onRemoveBook(day); }}
                    >
                      <X className="h-3 w-3 text-background" strokeWidth={2} />
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

      <div className="mx-auto flex w-full max-w-[26rem] gap-3 pt-6 pb-[max(1.5rem,calc(1.5rem+env(safe-area-inset-bottom,0px)))]">
        <button
          onClick={onBack}
          className="flex flex-1 items-center justify-center gap-2 rounded-[4px] border border-border py-4 text-xs font-body font-medium tracking-normal transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex flex-[2] items-center justify-center gap-2 rounded-[4px] bg-foreground py-4 text-xs font-body font-medium tracking-normal text-background transition-opacity hover:opacity-90"
        >
          {flow.chooseTemplateCta}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* View existing book detail */}
      {selectedDay !== null && entries[selectedDay] && !isReplacing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedDay(null)}>
          <BottomSheetKeyboardLift>
            <div
              className="flex w-full max-h-[85vh] animate-fade-in flex-col overflow-hidden rounded-t-[4px] border border-border bg-background font-body sm:rounded-[4px]"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between border-b border-border/50 p-5">
              <span className="font-display text-[20px] font-extrabold tracking-[0] text-[#121212]">
                {MONTHS[month]} {selectedDay}
              </span>
              <button onClick={() => setSelectedDay(null)} className="rounded-[4px] p-1 transition-colors hover:bg-secondary">
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

            <div className="flex gap-3 p-5 pt-0 pb-[max(1.25rem,calc(1.25rem+env(safe-area-inset-bottom,0px)))]">
              <button
                onClick={() => { onRemoveBook(selectedDay); setSelectedDay(null); }}
                className="flex-1 rounded-[4px] border border-border py-3 text-xs font-body font-medium tracking-normal transition-colors hover:bg-secondary"
              >
                Delete
              </button>
              <button
                onClick={() => setIsReplacing(true)}
                className="flex-1 rounded-[4px] bg-foreground py-3 text-xs font-body font-medium tracking-normal text-background transition-opacity hover:opacity-90"
              >
                Replace
              </button>
            </div>
            </div>
          </BottomSheetKeyboardLift>
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
