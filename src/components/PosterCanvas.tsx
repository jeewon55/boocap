import { forwardRef, useMemo } from 'react';
import { Book, MOODS, MoodType, TemplateType } from '@/types/book';

const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
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

const BookImg = ({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) => (
  <img
    src={src}
    alt={alt}
    crossOrigin="anonymous"
    referrerPolicy="no-referrer"
    style={{ objectFit: 'cover', ...style }}
    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
  />
);

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
    const baseStyle: React.CSSProperties = {
      width: 600,
      aspectRatio: '9/16',
      backgroundColor: moodConfig.bgColor,
      color: moodConfig.textColor,
      fontFamily: "'Instrument Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    };

    const emptyState = (
      <p style={{ fontSize: 14, opacity: 0.3, letterSpacing: '0.2em', textAlign: 'center' }}>ADD BOOKS TO PREVIEW</p>
    );

    // ─── GRID: Calendar view ───
    if (template === 'grid') {
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const blanks = Array.from({ length: firstDay });
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      return (
        <div ref={ref} style={baseStyle}>
          {/* Top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '28px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <p style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>{MONTHS[month]}</p>
              <p style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em', color: moodConfig.accentColor }}>{year}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', opacity: 0.4 }}>MONTHLY RECAP</p>
              <p style={{ fontSize: 10, opacity: 0.3, marginTop: 4 }}>{readDays} DAYS · {books.length} BOOKS</p>
            </div>
          </div>

          {/* Calendar */}
          <div style={{ position: 'absolute', top: 140, left: 24, right: 24, bottom: 60 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 6 }}>
              {WEEKDAYS.map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: 9, letterSpacing: '0.12em', opacity: 0.3, padding: '4px 0' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, flex: 1 }}>
              {blanks.map((_, i) => <div key={`b${i}`} />)}
              {days.map((day) => {
                const book = entries[day];
                return (
                  <div key={day} style={{ aspectRatio: '3/4', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${moodConfig.textColor}12`, overflow: 'hidden' }}>
                    {book ? (
                      <BookImg src={book.coverUrl} alt={book.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                    ) : (
                      <span style={{ fontSize: 10, opacity: 0.2 }}>{day}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom accent */}
          <div style={{ position: 'absolute', bottom: 20, left: 32, width: 30, height: 2, backgroundColor: moodConfig.accentColor }} />
        </div>
      );
    }

    // ─── STACK: Overlapping cards, big bottom type ───
    if (template === 'stack') {
      return (
        <div ref={ref} style={baseStyle}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 32, display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, letterSpacing: '0.3em', opacity: 0.4 }}>MONTHLY RECAP</p>
            <p style={{ fontSize: 11, opacity: 0.35 }}>{readDays} DAYS · {books.length} BOOKS</p>
          </div>
          <div style={{ position: 'absolute', left: 32, top: 64, width: 30, height: 2, backgroundColor: moodConfig.accentColor }} />

          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            {books.length === 0 ? emptyState : books.length <= 3 ? (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
                {books.map((book, i) => (
                  <div key={book.key} style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.3)', transform: `rotate(${(i - Math.floor(books.length / 2)) * 4}deg)` }}>
                    <BookImg src={book.coverUrl} alt={book.title} style={{ width: 150, height: 215 }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', maxWidth: 420 }}>
                {books.slice(0, 6).map((book, i) => (
                  <div key={book.key} style={{ boxShadow: '0 15px 40px rgba(0,0,0,0.25)', transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}>
                    <BookImg src={book.coverUrl} alt={book.title} style={{ width: 110, height: 158 }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 32 }}>
            <p style={{ fontSize: 64, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.03em' }}>{MONTHS[month]}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
              <p style={{ fontSize: 64, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.03em', color: moodConfig.accentColor }}>{year}</p>
              {books.length > 0 && (
                <div style={{ textAlign: 'right', maxWidth: 180 }}>
                  {books.slice(0, 3).map((b) => (
                    <p key={b.key} style={{ fontSize: 8, opacity: 0.5, lineHeight: 1.5 }}>{b.title.toUpperCase()}</p>
                  ))}
                  {books.length > 3 && <p style={{ fontSize: 8, opacity: 0.3 }}>+{books.length - 3} MORE</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ─── COLLAGE: Scattered covers, centered type ───
    if (template === 'collage') {
      return (
        <div ref={ref} style={baseStyle}>
          {/* Scattered books fill most of the canvas */}
          {books.length === 0 ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{emptyState}</div>
          ) : (
            <>
              {books.slice(0, 6).map((book, i) => {
                const positions = [
                  { top: '5%', left: '5%', rotate: -8, w: 155, h: 220 },
                  { top: '3%', left: '55%', rotate: 5, w: 140, h: 200 },
                  { top: '30%', left: '30%', rotate: -2, w: 160, h: 230 },
                  { top: '28%', left: '65%', rotate: 7, w: 120, h: 172 },
                  { top: '55%', left: '8%', rotate: 4, w: 130, h: 186 },
                  { top: '52%', left: '50%', rotate: -5, w: 145, h: 208 },
                ];
                const pos = positions[i];
                return (
                  <div key={book.key} style={{ position: 'absolute', top: pos.top, left: pos.left, transform: `rotate(${pos.rotate}deg)`, boxShadow: '0 15px 40px rgba(0,0,0,0.3)', zIndex: i }}>
                    <BookImg src={book.coverUrl} alt={book.title} style={{ width: pos.w, height: pos.h }} />
                  </div>
                );
              })}
            </>
          )}

          {/* Overlay type at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '60px 32px 32px', background: `linear-gradient(transparent, ${moodConfig.bgColor}ee 40%)` }}>
            <p style={{ fontSize: 13, letterSpacing: '0.25em', opacity: 0.5, marginBottom: 8 }}>MONTHLY RECAP</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.02em' }}>{MONTHS[month]}</p>
                <p style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.02em', color: moodConfig.accentColor }}>{year}</p>
              </div>
              <p style={{ fontSize: 10, opacity: 0.35, marginBottom: 4 }}>{readDays} DAYS · {books.length} BOOKS</p>
            </div>
          </div>
        </div>
      );
    }

    // ─── LIST: Numbered list, right-aligned type ───
    if (template === 'list') {
      return (
        <div ref={ref} style={baseStyle}>
          {/* Right-aligned header */}
          <div style={{ position: 'absolute', top: 0, right: 0, padding: 32, textAlign: 'right' }}>
            <p style={{ fontSize: 56, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.03em' }}>{MONTHS[month]}</p>
            <p style={{ fontSize: 56, fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.03em', color: moodConfig.accentColor }}>{year}</p>
            <div style={{ width: 30, height: 2, backgroundColor: moodConfig.accentColor, marginLeft: 'auto', marginTop: 12 }} />
          </div>

          {/* Book list */}
          <div style={{ position: 'absolute', left: 32, right: 32, top: 200, bottom: 80 }}>
            {books.length === 0 ? emptyState : books.slice(0, 7).map((book, i) => (
              <div key={book.key} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 700, opacity: 0.1, minWidth: 50, fontFamily: "'Instrument Sans', sans-serif" }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <BookImg src={book.coverUrl} alt={book.title} style={{ width: 52, height: 75, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1.3 }}>{book.title}</p>
                  <p style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>{book.author}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom stats */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 32px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', opacity: 0.3 }}>MONTHLY RECAP</p>
            <p style={{ fontSize: 10, opacity: 0.3 }}>{readDays} DAYS · {books.length} BOOKS</p>
          </div>
        </div>
      );
    }

    // fallback
    return <div ref={ref} style={baseStyle}>{emptyState}</div>;
  }
);

PosterCanvas.displayName = 'PosterCanvas';
