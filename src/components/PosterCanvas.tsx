import { forwardRef, useMemo } from 'react';
const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
import { Book, MOODS, MoodType, TemplateType } from '@/types/book';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

interface PosterCanvasProps {
  year: number;
  month: number;
  entries: Record<number, Book>;
  mood: MoodType;
  template?: TemplateType;
}

export const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  ({ year, month, entries, mood, template = 'stack' }, ref) => {
    const moodConfig = MOODS.find((m) => m.id === mood)!;
    const books = useMemo(() => {
      const unique = new Map<string, Book>();
      Object.values(entries).forEach((b) => {
        if (b) unique.set(b.key, b);
      });
      return Array.from(unique.values());
    }, [entries]);

    const readDays = Object.keys(entries).length;

    const renderBooks = () => {
      if (books.length === 0) {
        return <p style={{ fontSize: 14, opacity: 0.3, letterSpacing: '0.2em' }}>ADD BOOKS TO PREVIEW</p>;
      }

      switch (template) {
        case 'grid':
          return (
            <div className="grid grid-cols-3 gap-3 max-w-[380px]">
              {books.slice(0, 9).map((book) => (
                <div key={book.key} className="shadow-lg">
                  <img src={book.coverUrl} alt={book.title} className="w-full object-cover" style={{ aspectRatio: '2/3' }} crossOrigin="anonymous" />
                </div>
              ))}
            </div>
          );

        case 'collage':
          return (
            <div className="relative" style={{ width: 380, height: 400 }}>
              {books.slice(0, 5).map((book, i) => {
                const positions = [
                  { top: 0, left: 0, rotate: -5 },
                  { top: 20, left: 140, rotate: 3 },
                  { top: 120, left: 60, rotate: -2 },
                  { top: 160, left: 200, rotate: 6 },
                  { top: 80, left: 240, rotate: -4 },
                ];
                const pos = positions[i];
                return (
                  <div
                    key={book.key}
                    className="absolute shadow-2xl"
                    style={{ top: pos.top, left: pos.left, transform: `rotate(${pos.rotate}deg)` }}
                  >
                    <img src={book.coverUrl} alt={book.title} className="object-cover" style={{ width: 120, height: 170 }} crossOrigin="anonymous" />
                  </div>
                );
              })}
            </div>
          );

        case 'list':
          return (
            <div className="space-y-2 max-w-[400px] w-full px-4">
              {books.slice(0, 6).map((book, i) => (
                <div key={book.key} className="flex items-center gap-4">
                  <span style={{ fontSize: 36, fontWeight: 700, opacity: 0.15, fontFamily: "'Instrument Sans', sans-serif", minWidth: 50 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <img src={book.coverUrl} alt={book.title} className="shadow-md object-cover" style={{ width: 50, height: 72 }} crossOrigin="anonymous" />
                  <p style={{ fontSize: 12, letterSpacing: '0.05em', fontWeight: 500, opacity: 0.8 }}>
                    {book.title.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          );

        case 'stack':
        default:
          if (books.length <= 3) {
            return (
              <div className="flex gap-4 items-center justify-center">
                {books.map((book, i) => (
                  <div key={book.key} className="shadow-2xl" style={{ transform: `rotate(${(i - Math.floor(books.length / 2)) * 3}deg)` }}>
                    <img src={book.coverUrl} alt={book.title} className="object-cover" style={{ width: 140, height: 200 }} crossOrigin="anonymous" />
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div className="flex gap-3 items-center justify-center flex-wrap max-w-[400px]">
              {books.slice(0, 6).map((book, i) => (
                <div key={book.key} className="shadow-xl" style={{ transform: `rotate(${(i % 2 === 0 ? -2 : 2)}deg)` }}>
                  <img src={book.coverUrl} alt={book.title} className="object-cover" style={{ width: 100, height: 145 }} crossOrigin="anonymous" />
                </div>
              ))}
            </div>
          );
      }
    };

    return (
      <div
        ref={ref}
        className="relative overflow-hidden"
        style={{
          width: 600,
          aspectRatio: '9/16',
          backgroundColor: moodConfig.bgColor,
          color: moodConfig.textColor,
          fontFamily: "'Instrument Sans', sans-serif",
        }}
      >
        {/* Top */}
        <div className="absolute inset-x-0 top-0 p-8 flex justify-between items-start">
          <p style={{ fontSize: 13, letterSpacing: '0.3em', opacity: 0.4 }}>MONTHLY RECAP</p>
          <p style={{ fontSize: 11, opacity: 0.35 }}>{readDays} DAYS · {books.length} BOOKS</p>
        </div>

        {/* Accent line */}
        <div className="absolute left-8 top-16" style={{ width: 30, height: 2, backgroundColor: moodConfig.accentColor }} />

        {/* Center */}
        <div className="absolute inset-0 flex items-center justify-center px-8">
          {renderBooks()}
        </div>

        {/* Bottom */}
        <div className="absolute inset-x-0 bottom-0 p-8">
          <p style={{ fontSize: 64, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.03em' }}>
            {MONTHS[month]}
          </p>
          <div className="flex items-end justify-between mt-1">
            <p style={{ fontSize: 64, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.03em', color: moodConfig.accentColor }}>
              {year}
            </p>
            {books.length > 0 && (
              <div style={{ textAlign: 'right', maxWidth: 180 }}>
                {books.slice(0, 3).map((b) => (
                  <p key={b.key} style={{ fontSize: 8, opacity: 0.5, lineHeight: 1.5 }}>
                    {b.title.toUpperCase()}
                  </p>
                ))}
                {books.length > 3 && (
                  <p style={{ fontSize: 8, opacity: 0.3 }}>+{books.length - 3} MORE</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PosterCanvas.displayName = 'PosterCanvas';
