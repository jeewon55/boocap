import { forwardRef, useMemo } from 'react';
import { Book, MOODS, MoodType } from '@/types/book';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

interface PosterCanvasProps {
  year: number;
  month: number;
  entries: Record<number, Book>;
  mood: MoodType;
}

export const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  ({ year, month, entries, mood }, ref) => {
    const moodConfig = MOODS.find((m) => m.id === mood)!;
    const books = useMemo(() => {
      const unique = new Map<string, Book>();
      Object.values(entries).forEach((b) => {
        if (b) unique.set(b.key, b);
      });
      return Array.from(unique.values());
    }, [entries]);

    const readDays = Object.keys(entries).length;

    return (
      <div
        ref={ref}
        className="relative overflow-hidden"
        style={{
          width: 600,
          aspectRatio: '3/4',
          backgroundColor: moodConfig.bgColor,
          color: moodConfig.textColor,
          fontFamily: "'Instrument Sans', sans-serif",
        }}
      >
        {/* Top section */}
        <div className="absolute inset-x-0 top-0 p-8 flex justify-between items-start">
          <div>
            <p style={{ fontSize: 14, letterSpacing: '0.3em', opacity: 0.5 }}>MONTHLY RECAP</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, opacity: 0.4 }}>{readDays} DAYS · {books.length} BOOKS</p>
          </div>
        </div>

        {/* Center - Book covers */}
        <div className="absolute inset-0 flex items-center justify-center px-10">
          {books.length === 0 ? (
            <p style={{ fontSize: 14, opacity: 0.3, letterSpacing: '0.2em' }}>ADD BOOKS TO PREVIEW</p>
          ) : books.length <= 3 ? (
            <div className="flex gap-4 items-center justify-center">
              {books.map((book, i) => (
                <div
                  key={book.key}
                  className="shadow-2xl"
                  style={{
                    transform: `rotate(${(i - Math.floor(books.length / 2)) * 3}deg)`,
                    transition: 'transform 0.2s',
                  }}
                >
                  <img
                    src={book.coverUrl.replace('-M.jpg', '-L.jpg')}
                    alt={book.title}
                    className="object-cover"
                    style={{ width: 140, height: 200 }}
                    crossOrigin="anonymous"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 max-w-[400px]">
              {books.slice(0, 6).map((book) => (
                <div key={book.key} className="shadow-lg">
                  <img
                    src={book.coverUrl.replace('-M.jpg', '-L.jpg')}
                    alt={book.title}
                    className="w-full object-cover"
                    style={{ aspectRatio: '2/3' }}
                    crossOrigin="anonymous"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom - Typography */}
        <div className="absolute inset-x-0 bottom-0 p-8">
          <p
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: '-0.03em',
            }}
          >
            {MONTHS[month]}
          </p>
          <div className="flex items-end justify-between mt-1">
            <p
              style={{
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 0.9,
                letterSpacing: '-0.03em',
                color: moodConfig.accentColor,
              }}
            >
              {year}
            </p>
            {books.length > 0 && (
              <div style={{ textAlign: 'right', maxWidth: 200 }}>
                {books.slice(0, 3).map((b) => (
                  <p key={b.key} style={{ fontSize: 9, opacity: 0.5, lineHeight: 1.4 }}>
                    {b.title.toUpperCase()}
                  </p>
                ))}
                {books.length > 3 && (
                  <p style={{ fontSize: 9, opacity: 0.3 }}>+{books.length - 3} MORE</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Accent line */}
        <div
          className="absolute left-8 top-16"
          style={{
            width: 30,
            height: 2,
            backgroundColor: moodConfig.accentColor,
          }}
        />
      </div>
    );
  }
);

PosterCanvas.displayName = 'PosterCanvas';
