import { useState } from 'react';
import { Book, MAX_BOOKS_PER_MONTH } from '@/types/book';
import { toast } from '@/hooks/use-toast';
import { BookSearchModal } from '@/components/BookSearchModal';
import { BottomSheetKeyboardLift } from '@/components/BottomSheetKeyboardLift';
import { MonthSelector } from '@/components/MonthSelector';
import { X, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { buildCalendarWeekRows, twoDigitDay, WEEK_LETTERS_MON } from '@/lib/calendarGrid';
import { useLocale } from '@/contexts/LocaleContext';
import { createFlowMessages } from '@/i18n/createFlow';

function CalendarCover({ book, onRemove }: { book: Book; onRemove: (e: React.MouseEvent) => void }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <>
      {imgOk ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgOk(false)}
        />
      ) : (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-muted">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
      <div
        className="absolute right-0 top-0 cursor-pointer rounded-bl-sm bg-primary/80 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onRemove}
      >
        <X className="h-2.5 w-2.5 text-primary-foreground" />
      </div>
    </>
  );
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

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
  const { locale } = useLocale();
  const flow = createFlowMessages[locale];
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [showNoBookModal, setShowNoBookModal] = useState(false);

  const weekRows = buildCalendarWeekRows(year, month);
  const hasSelectedBooks = Object.keys(entries).length > 0;

  const handleNext = () => {
    if (!hasSelectedBooks) {
      setShowNoBookModal(true);
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col px-6">
      <div className="mx-auto w-full max-w-[26rem] pt-2 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center"
        >
          <h2 className="mt-2 mb-2 font-display text-[20px] font-extrabold leading-none tracking-[0] text-[#d6d6d6]">
            {flow.markYourDaysTitle}
          </h2>
        </motion.div>

        <MonthSelector
          year={year}
          month={month}
          onChange={onMonthChange}
          compactHeader
          compactLeading={
            <span
              className="select-none font-display font-black tracking-[0] text-foreground"
              style={{ fontSize: 'clamp(3rem, 14vw, 3.75rem)', lineHeight: 0.82 }}
            >
              {MONTHS_SHORT[month]}
            </span>
          }
        />

        {/* Editorial calendar — horizontal rules only, Monday-first, two-digit dates */}
        <div className="relative mt-0.5 overflow-hidden rounded-sm px-1 pb-0.5 pt-1">
          <div className="relative z-[1] grid grid-cols-7 border-b border-border/35 px-0.5 pb-2 pt-0">
            {WEEK_LETTERS_MON.map(({ letter, title }) => (
              <div
                key={title}
                title={title}
                className="text-center font-body text-[11px] font-semibold text-muted-foreground"
              >
                {letter}
              </div>
            ))}
          </div>

          <div className="relative z-[1] font-body">
            {weekRows.map((row, ri) => (
              <div
                key={`w-${ri}`}
                className="grid grid-cols-7 border-b border-border/35 last:border-b-0"
              >
                {row.map((cell, ci) => {
                  const cellKey = `cell-${ri}-${ci}`;
                  switch (cell.scope) {
                    case 'adjacent':
                      return (
                        <div
                          key={cellKey}
                          className="pointer-events-none flex aspect-[3/4] w-full min-w-0 items-start justify-start p-1.5"
                        >
                          <span className="font-display text-[22px] font-bold tabular-nums leading-none tracking-tighter text-[#d6d6d6]">
                            {twoDigitDay(cell.day)}
                          </span>
                        </div>
                      );
                    case 'current': {
                      const day = cell.day;
                      const book = entries[day];
                      return (
                        <button
                          key={cellKey}
                          type="button"
                          onClick={() => {
                            const filledCount = Object.values(entries).filter(Boolean).length;
                            if (!book && filledCount >= MAX_BOOKS_PER_MONTH) {
                              toast({
                                title: 'You can add up to 12 books.',
                              });
                              return;
                            }
                            setSelectedDay(day);
                          }}
                          aria-label={`${MONTHS_SHORT[month]} ${twoDigitDay(day)}${book ? `, ${book.title}` : ''}`}
                          className={`group relative flex aspect-[3/4] w-full min-w-0 flex-col rounded-none text-left transition-colors hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground/25 ${
                            book ? 'overflow-hidden p-0' : 'items-start justify-start p-1.5'
                          }`}
                        >
                          {book ? (
                            <div className="absolute inset-0 overflow-hidden shadow-sm ring-1 ring-inset ring-border">
                              <CalendarCover
                                book={book}
                                onRemove={(e) => {
                                  e.stopPropagation();
                                  onRemoveBook(day);
                                }}
                              />
                            </div>
                          ) : (
                            <span className="font-display text-[22px] font-bold tabular-nums leading-none tracking-tighter text-foreground">
                              {twoDigitDay(day)}
                            </span>
                          )}
                        </button>
                      );
                    }
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 - 화면이 짧아도 항상 보임 */}
      <div className="sticky bottom-0 mx-auto w-full max-w-[26rem] bg-background py-4">
        <button
          onClick={handleNext}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-primary py-4 font-body text-xs font-semibold tracking-normal text-primary-foreground transition-opacity hover:opacity-90"
        >
          {flow.chooseTemplateCta}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        {import.meta.env.DEV ? (
          <div className="mt-3 text-center">
            <a
              href="/create/qa-posters"
              target="_blank"
              rel="noreferrer"
              className="font-body text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Poster QA (new tab) — keep this tab for the product flow
            </a>
          </div>
        ) : null}
      </div>

      {/* View existing book detail */}
      {selectedDay !== null && entries[selectedDay] && !isReplacing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/15" onClick={() => setSelectedDay(null)}>
          <BottomSheetKeyboardLift>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full max-h-[85vh] flex-col overflow-hidden rounded-t-[4px] border border-foreground/20 bg-card font-body sm:rounded-[4px] sm:shadow-[10px_10px_0_0_rgba(0,0,0,0.06)]"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <span className="font-display text-[20px] font-extrabold tracking-[0] text-[#121212]">
                {MONTHS[month]} {String(selectedDay).padStart(2, '0')}
              </span>
              <button onClick={() => setSelectedDay(null)} className="rounded-[4px] p-1 transition-colors hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col items-center gap-4">
              <img
                src={entries[selectedDay].coverUrl}
                alt={entries[selectedDay].title}
                className="w-28 h-40 object-cover shadow-lg rounded"
              />
              <div className="text-center">
                <p className="font-body text-sm font-medium">{entries[selectedDay].title}</p>
                {entries[selectedDay].author && (
                  <p className="mt-1 font-body text-xs text-muted-foreground">{entries[selectedDay].author}</p>
                )}
              </div>
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={() => { onRemoveBook(selectedDay); setSelectedDay(null); }}
                className="flex-1 rounded-[4px] border border-border py-3 font-body text-xs font-medium tracking-normal transition-colors hover:bg-secondary"
              >
                Delete
              </button>
              <button
                onClick={() => setIsReplacing(true)}
                className="flex-1 rounded-[4px] bg-primary py-3 font-body text-xs font-semibold tracking-normal text-primary-foreground transition-opacity hover:opacity-90"
              >
                Replace
              </button>
            </div>
            </motion.div>
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

      {/* Guard modal: block next step when no book is selected */}
      {showNoBookModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 px-6"
          onClick={() => setShowNoBookModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-sm rounded-[4px] border border-foreground/20 bg-card p-5 font-body shadow-[10px_10px_0_0_rgba(0,0,0,0.06)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-[18px] font-bold tracking-[0] text-foreground">{flow.noBookModalTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{flow.noBookModalBody}</p>
            <button
              type="button"
              onClick={() => setShowNoBookModal(false)}
              className="mt-5 w-full rounded-[4px] bg-primary py-3 text-xs font-semibold tracking-normal text-primary-foreground transition-opacity hover:opacity-90"
            >
              {flow.noBookModalOk}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
