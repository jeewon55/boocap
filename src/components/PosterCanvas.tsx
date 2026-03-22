import { forwardRef, useMemo } from 'react';
import { Book, MOODS, MoodType, TemplateType } from '@/types/book';
import paperTexture from '@/assets/paper-texture.jpg';

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
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const baseStyle: React.CSSProperties = {
      width: 600,
      aspectRatio: '4/5',
      backgroundColor: moodConfig.bgColor,
      color: moodConfig.textColor,
      fontFamily: "'Instrument Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    };

    const emptyState = (
      <p style={{ fontSize: 14, opacity: 0.3, letterSpacing: '0.2em', textAlign: 'center' }}>ADD BOOKS TO PREVIEW</p>
    );

    // ─── GRID ───
    if (template === 'grid') {
      const firstDay = new Date(year, month, 1).getDay();
      const blanks = Array.from({ length: firstDay });
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      return (
        <div ref={ref} style={baseStyle}>
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
          <div style={{ position: 'absolute', bottom: 20, left: 32, width: 30, height: 2, backgroundColor: moodConfig.accentColor }} />
        </div>
      );
    }

    // ─── STACK (Creative Collage) ───
    if (template === 'stack') {
      const monthName = MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase();

      // Sparkle SVG component
      const Sparkle = ({ x, y, size = 28, color = '#C8A2C8', opacity = 0.6 }: { x: number; y: number; size?: number; color?: string; opacity?: number }) => (
        <svg style={{ position: 'absolute', left: x, top: y, width: size, height: size, opacity }} viewBox="0 0 24 24" fill={color}>
          <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
        </svg>
      );

      // Layout positions based on book count
      const getPositions = (count: number) => {
        if (count <= 2) return [
          { left: '8%', top: '30%', rotate: -4, w: 160, h: 230 },
          { left: '52%', top: '28%', rotate: 3, w: 160, h: 230 },
        ];
        if (count <= 3) return [
          { left: '5%', top: '28%', rotate: -5, w: 145, h: 208 },
          { left: '36%', top: '32%', rotate: 2, w: 145, h: 208 },
          { left: '65%', top: '26%', rotate: -3, w: 145, h: 208 },
        ];
        return [
          { left: '4%', top: '27%', rotate: -4, w: 125, h: 180 },
          { left: '30%', top: '30%', rotate: 3, w: 125, h: 180 },
          { left: '56%', top: '25%', rotate: -2, w: 125, h: 180 },
          { left: '12%', top: '54%', rotate: 5, w: 125, h: 180 },
          { left: '42%', top: '52%', rotate: -3, w: 125, h: 180 },
          { left: '68%', top: '56%', rotate: 4, w: 125, h: 180 },
        ];
      };

      const positions = getPositions(books.length);

      return (
        <div ref={ref} style={{ ...baseStyle, backgroundColor: '#F5F3EE' }}>
          {/* Paper texture overlay */}
          <img src={paperTexture} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, mixBlendMode: 'multiply' }} />

          {/* Sparkle decorations - larger and more */}
          <Sparkle x={50} y={15} size={56} color="#D4A0D4" opacity={0.5} />
          <Sparkle x={340} y={5} size={42} color="#A8D8A8" opacity={0.45} />
          <Sparkle x={500} y={40} size={36} color="#A8D8A8" opacity={0.35} />
          <Sparkle x={530} y={600} size={48} color="#D4A0D4" opacity={0.35} />
          <Sparkle x={20} y={670} size={38} color="#A8D8A8" opacity={0.4} />
          <Sparkle x={280} y={680} size={32} color="#D4A0D4" opacity={0.3} />
          <Sparkle x={440} y={350} size={28} color="#A8D8A8" opacity={0.25} />
          <Sparkle x={10} y={380} size={34} color="#D4A0D4" opacity={0.28} />

          {/* Title section */}
          <div style={{ position: 'absolute', top: 36, left: 0, right: 0, textAlign: 'center', zIndex: 20 }}>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: 57, fontWeight: 400, color: '#2B3A67', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              what I read
            </p>
            <p style={{ fontFamily: "'Noto Sans KR', 'Inter', sans-serif", fontSize: 63, fontWeight: 700, color: '#2B3A67', lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: -2 }}>
              in {monthName}
            </p>
          </div>

          {/* Book covers - free collage */}
          {books.length === 0 ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 13, opacity: 0.25, letterSpacing: '0.15em', color: '#2C2C2C', fontFamily: "'Inter', sans-serif" }}>ADD BOOKS TO PREVIEW</p>
            </div>
          ) : (
            books.slice(0, 6).map((book, i) => {
              const pos = positions[Math.min(i, positions.length - 1)];
              return (
                <div key={book.key} style={{
                  position: 'absolute',
                  left: pos.left,
                  top: pos.top,
                  transform: `rotate(${pos.rotate}deg)`,
                  zIndex: 10 + i,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <div style={{ boxShadow: '0 3px 12px rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <BookImg src={book.coverUrl} alt={book.title} style={{ width: pos.w, height: pos.h }} />
                  </div>
                  <p style={{
                    fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
                    fontSize: 11,
                    color: '#2C2C2C',
                    opacity: 0.65,
                    marginTop: 6,
                    textAlign: 'center',
                    maxWidth: pos.w + 10,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {book.title}
                  </p>
                </div>
              );
            })
          )}

          {/* Small decorative arrows between items */}
          <svg style={{ position: 'absolute', left: '48%', top: '48%', width: 16, height: 16, opacity: 0.2, zIndex: 5 }} viewBox="0 0 24 24" fill="none" stroke="#2C2C2C" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>

          {/* Year small text */}
          <p style={{ position: 'absolute', bottom: 24, right: 32, fontSize: 12, opacity: 0.25, color: '#2C2C2C', fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>{year}</p>
        </div>
      );
    }

    // ─── COLLAGE ───
    if (template === 'collage') {
      return (
        <div ref={ref} style={baseStyle}>
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

    // ─── LIST ───
    if (template === 'list') {
      return (
        <div ref={ref} style={baseStyle}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: 32, textAlign: 'right' }}>
            <p style={{ fontSize: 56, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.03em' }}>{MONTHS[month]}</p>
            <p style={{ fontSize: 56, fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.03em', color: moodConfig.accentColor }}>{year}</p>
            <div style={{ width: 30, height: 2, backgroundColor: moodConfig.accentColor, marginLeft: 'auto', marginTop: 12 }} />
          </div>
          <div style={{ position: 'absolute', left: 32, right: 32, top: 200, bottom: 80 }}>
            {books.length === 0 ? emptyState : books.slice(0, 7).map((book, i) => (
              <div key={book.key} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 700, opacity: 0.1, minWidth: 50 }}>{String(i + 1).padStart(2, '0')}</span>
                <BookImg src={book.coverUrl} alt={book.title} style={{ width: 52, height: 75, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1.3 }}>{book.title}</p>
                  <p style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>{book.author}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 32px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', opacity: 0.3 }}>MONTHLY RECAP</p>
            <p style={{ fontSize: 10, opacity: 0.3 }}>{readDays} DAYS · {books.length} BOOKS</p>
          </div>
        </div>
      );
    }

    // ─── SPINE STACK: Vertical spines ───
    if (template === 'spine') {
      const spineColors = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A', '#F4A261', '#264653', '#6B705C', '#CB997E'];
      return (
        <div ref={ref} style={baseStyle}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '28px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <p style={{ fontSize: 11, letterSpacing: '0.3em', opacity: 0.4 }}>MONTHLY RECAP</p>
              <p style={{ fontSize: 10, opacity: 0.3, marginTop: 4 }}>{readDays} DAYS · {books.length} BOOKS</p>
            </div>
          </div>

          {/* Spine visualization */}
          <div style={{ position: 'absolute', left: 32, right: 32, top: 80, bottom: 120, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            {books.length === 0 ? (
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{emptyState}</div>
            ) : (
              books.slice(0, 8).map((book, i) => {
                const height = 60 + Math.random() * 30;
                return (
                  <div
                    key={book.key}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      backgroundColor: spineColors[i % spineColors.length],
                      borderRadius: '3px 3px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      minWidth: 0,
                    }}
                  >
                    <p style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#fff',
                      letterSpacing: '0.05em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxHeight: '90%',
                      padding: '8px 0',
                    }}>
                      {book.title}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom type */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 32px 28px' }}>
            <p style={{ fontSize: 48, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.03em' }}>{MONTHS[month]}</p>
            <p style={{ fontSize: 48, fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.03em', color: moodConfig.accentColor }}>{year}</p>
          </div>
        </div>
      );
    }

    // ─── INSIGHT CALENDAR: Dot/grass calendar ───
    if (template === 'calendar') {
      const firstDay = new Date(year, month, 1).getDay();
      const blanks2 = Array.from({ length: firstDay });
      const days2 = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      return (
        <div ref={ref} style={baseStyle}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '28px 32px 0' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.3em', opacity: 0.4 }}>INSIGHT CALENDAR</p>
            <p style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', marginTop: 8 }}>{MONTHS[month]}</p>
            <p style={{ fontSize: 48, fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.02em', color: moodConfig.accentColor }}>{year}</p>
          </div>

          {/* Calendar dots */}
          <div style={{ position: 'absolute', left: 32, right: 32, top: 220, bottom: 80 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 12 }}>
              {WEEKDAYS.map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: 9, letterSpacing: '0.12em', opacity: 0.3, padding: '4px 0' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {blanks2.map((_, i) => <div key={`b${i}`} />)}
              {days2.map((day) => {
                const hasBook = !!entries[day];
                return (
                  <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      backgroundColor: hasBook ? '#4ADE80' : `${moodConfig.textColor}10`,
                      opacity: hasBook ? 1 : 0.3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      {hasBook && (
                        <span style={{ fontSize: 16 }}>📖</span>
                      )}
                    </div>
                    <span style={{ fontSize: 8, opacity: 0.4 }}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 32px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', opacity: 0.3 }}>MONTHLY RECAP</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: '#4ADE80' }} />
                <span style={{ fontSize: 9, opacity: 0.4 }}>Read</span>
              </div>
              <span style={{ fontSize: 10, opacity: 0.3 }}>{readDays}/{daysInMonth} days</span>
            </div>
          </div>
        </div>
      );
    }

    // ─── TYPOGRAPHY POSTER: Text only ───
    if (template === 'typography') {
      return (
        <div ref={ref} style={baseStyle}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '28px 32px 0' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.3em', opacity: 0.4 }}>MONTHLY RECAP</p>
          </div>

          <div style={{ position: 'absolute', left: 32, right: 32, top: 80, bottom: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {books.length === 0 ? emptyState : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {books.slice(0, 6).map((book, i) => {
                  const sizes = [56, 42, 36, 30, 26, 22];
                  const size = sizes[Math.min(i, sizes.length - 1)];
                  const opacity = 1 - i * 0.12;
                  return (
                    <div key={book.key}>
                      <p style={{
                        fontSize: size,
                        fontWeight: 700,
                        lineHeight: 1.05,
                        letterSpacing: '-0.02em',
                        opacity,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {book.title.toUpperCase()}
                      </p>
                      <p style={{ fontSize: 10, opacity: 0.35, marginTop: 1, letterSpacing: '0.1em' }}>
                        {book.author.toUpperCase()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 32px 28px' }}>
            <div style={{ width: 40, height: 2, backgroundColor: moodConfig.accentColor, marginBottom: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: 40, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.03em' }}>{MONTHS[month]}</p>
                <p style={{ fontSize: 40, fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.03em', color: moodConfig.accentColor }}>{year}</p>
              </div>
              <p style={{ fontSize: 10, opacity: 0.3 }}>{books.length} BOOKS · {readDays} DAYS</p>
            </div>
          </div>
        </div>
      );
    }

    // ─── MINIMAL ARCHIVE: Thin lines, small text ───
    if (template === 'archive') {
      return (
        <div ref={ref} style={baseStyle}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '32px 32px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${moodConfig.textColor}20`, paddingBottom: 12 }}>
              <div>
                <p style={{ fontSize: 13, letterSpacing: '0.3em', opacity: 0.4 }}>ARCHIVE</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, letterSpacing: '0.1em', fontWeight: 600 }}>{MONTHS[month]} {year}</p>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', left: 32, right: 32, top: 90, bottom: 80, overflowY: 'hidden' }}>
            {books.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{emptyState}</div>
            ) : (
              books.slice(0, 10).map((book, i) => (
                <div
                  key={book.key}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: `1px solid ${moodConfig.textColor}10`,
                  }}
                >
                  <span style={{ fontSize: 9, opacity: 0.25, fontVariantNumeric: 'tabular-nums', minWidth: 20 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1.4 }}>
                      {book.title}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, opacity: 0.3, flexShrink: 0 }}>
                    {book.author}
                  </span>
                </div>
              ))
            )}
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 32px 28px' }}>
            <div style={{ borderTop: `1px solid ${moodConfig.textColor}20`, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 9, letterSpacing: '0.2em', opacity: 0.3 }}>TOTAL {books.length} BOOKS</p>
              <p style={{ fontSize: 9, letterSpacing: '0.2em', opacity: 0.3 }}>{readDays} READING DAYS</p>
            </div>
          </div>
        </div>
      );
    }

    // fallback
    return <div ref={ref} style={baseStyle}>{emptyState}</div>;
  }
);

PosterCanvas.displayName = 'PosterCanvas';
