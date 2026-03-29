import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Book, MOODS, MoodType, TemplateType } from '@/types/book';
import { getPaleDominantCoverBackground } from '@/lib/mosaicCoverColor';
import paperTexture from '@/assets/paper-texture.jpg';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** Mosaic poster: 1–3 books = one row; 4 = 2×2; then wider tiles up to 9 = 3×3; scales beyond. */
function mosaicGridDims(bookCount: number): { cols: number; rows: number } {
  const n = bookCount;
  if (n <= 0) return { cols: 1, rows: 1 };
  if (n <= 3) return { cols: n, rows: 1 };
  if (n === 4) return { cols: 2, rows: 2 };
  if (n <= 6) return { cols: 3, rows: 2 };
  if (n <= 8) return { cols: 4, rows: 2 };
  if (n === 9) return { cols: 3, rows: 3 };
  if (n === 10) return { cols: 5, rows: 2 };
  if (n <= 12) return { cols: 4, rows: 3 };
  if (n <= 15) return { cols: 5, rows: 3 };
  if (n <= 16) return { cols: 4, rows: 4 };
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  return { cols, rows };
}

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Insight calendar: 그리운 코코초이툰 + hangul fallback */
const CALENDAR_POSTER_FONT = "'Griun Cocochoitoon', 'Noto Sans KR', sans-serif";

/** Date grid rows: fixed px height so 4–6 week months look consistent */
const CALENDAR_DATE_ROW_H_PX = Math.round(88 * 1.2);

function fract01(n: number): number {
  return n - Math.floor(n);
}

function wobbleSegmentLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  segments: number,
  amplitude = 1,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  let d = `M ${x1} ${y1}`;
  for (let s = 1; s <= segments; s++) {
    const t = s / segments;
    const bx = x1 + dx * t;
    const by = y1 + dy * t;
    const r1 = fract01(seed * 17.413 + s * 3.891);
    const r2 = fract01(seed * 91.7 + s * 12.1);
    const wobble =
      ((r1 - 0.5) * 2.9 + Math.sin((seed + s) * 0.83) * 0.62 + (r2 - 0.5) * 0.45) * amplitude;
    d += ` L ${bx + nx * wobble} ${by + ny * wobble}`;
  }
  return d;
}

function doodleStrokeWidth(seed: number): number {
  return 1.02 + fract01(seed * 47.91823) * 0.95;
}

/** Open book outline with wobbly segments (Insight Calendar cells) */
function CalendarOpenBookIcon({ color, seed }: { color: string; seed: number }) {
  const s = seed * 19.413;
  const amp = 0.62;
  const stroke = (k: number) => doodleStrokeWidth(s + k * 13.1);
  const p = {
    fill: 'none' as const,
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg
      width={44}
      height={28}
      viewBox="0 0 48 30"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d={wobbleSegmentLine(24, 4.1, 8.6, 7.4, s + 2, 4, amp)}
        strokeWidth={stroke(1)}
        {...p}
      />
      <path
        d={wobbleSegmentLine(8.6, 7.4, 8.4, 24.1, s + 19, 7, amp)}
        strokeWidth={stroke(2)}
        {...p}
      />
      <path
        d={wobbleSegmentLine(8.4, 24.1, 22.6, 22.7, s + 37, 5, amp)}
        strokeWidth={stroke(3)}
        {...p}
      />
      <path
        d={wobbleSegmentLine(24, 4.1, 23.2, 22.9, s + 53, 9, amp * 0.85)}
        strokeWidth={stroke(4) * 0.92}
        {...p}
        opacity={0.95}
      />
      <path
        d={wobbleSegmentLine(24, 4.1, 39.4, 7.4, s + 71, 4, amp)}
        strokeWidth={stroke(5)}
        {...p}
      />
      <path
        d={wobbleSegmentLine(39.4, 7.4, 39.6, 24.1, s + 88, 7, amp)}
        strokeWidth={stroke(6)}
        {...p}
      />
      <path
        d={wobbleSegmentLine(39.6, 24.1, 25.4, 22.7, s + 104, 5, amp)}
        strokeWidth={stroke(7)}
        {...p}
      />
    </svg>
  );
}

function wobbleOvalPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  n = 44,
  jitterScale = 1,
): string {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const jr = (fract01(seed * 7.17 + i * 2.31) - 0.5) * 2.2 * jitterScale;
    const x = cx + (rx + jr) * Math.cos(a) + (fract01(seed + i * 5.1) - 0.5) * 0.55 * jitterScale;
    const y = cy + (ry + jr * 0.55) * Math.sin(a);
    d += (i === 0 ? 'M ' : ' L ') + `${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d} Z`;
}

function buildInsightDoodleGridLines(opts: {
  gx: number;
  gy: number;
  gw: number;
  gh: number;
  weekH: number;
  rowCount: number;
  seed: number;
  /** Per-date-row height in px; default fills (gh - weekH) / rowCount */
  rowH?: number;
}): { d: string; sw: number }[] {
  const { gx, gy, gw, gh, weekH, rowCount, seed } = opts;
  const colW = gw / 7;
  const rowH = opts.rowH ?? (gh - weekH) / rowCount;
  const lines: { d: string; sw: number }[] = [];
  let k = 0;
  /** Softer hand-drawn look: lower amplitude + fewer kinks */
  const lineWobble = 0.38;
  const vertSegs = 12;
  const horizSegs = Math.max(10, Math.ceil(gw / 28));

  for (let i = 0; i <= 7; i++) {
    const x = gx + i * colW;
    lines.push({
      d: wobbleSegmentLine(x, gy, x, gy + gh, seed + k * 31, vertSegs, lineWobble),
      sw: doodleStrokeWidth(seed + 300 + i * 17),
    });
    k++;
  }

  for (let j = 0; j <= rowCount + 1; j++) {
    const y = j === 0 ? gy : gy + weekH + (j - 1) * rowH;
    lines.push({
      d: wobbleSegmentLine(gx, y, gx + gw, y, seed + k * 41, horizSegs, lineWobble),
      sw: doodleStrokeWidth(seed + 400 + j * 23),
    });
    k++;
  }

  const innerBottom = gy + weekH + rowCount * rowH;
  const gridBottom = gy + gh;
  if (gridBottom - innerBottom > 0.5) {
    lines.push({
      d: wobbleSegmentLine(gx, gridBottom, gx + gw, gridBottom, seed + k * 41, horizSegs, lineWobble),
      sw: doodleStrokeWidth(seed + 400 + (rowCount + 2) * 23),
    });
  }

  return lines;
}

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

const MOSAIC_FALLBACK_COLORS = [
  '#FFE8E2',
  '#E8F4FA',
  '#E8ECF6',
  '#EFF8E5',
  '#FFF0E0',
  '#FDECF4',
  '#F2EDFC',
  '#FCF6E6',
  '#E8F6E4',
];

function MosaicBookCell({
  book,
  cols,
  coverMaxW,
  fallbackBg,
}: {
  book: Book;
  cols: number;
  coverMaxW: number;
  fallbackBg: string;
}) {
  const [bg, setBg] = useState(fallbackBg);

  useEffect(() => {
    setBg(fallbackBg);
    let cancelled = false;
    getPaleDominantCoverBackground(book.coverUrl).then((c) => {
      if (!cancelled && c) setBg(c);
    });
    return () => {
      cancelled = true;
    };
  }, [book.coverUrl, fallbackBg]);

  return (
    <div
      style={{
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: cols <= 2 ? 1 : 0,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <div
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          filter: 'drop-shadow(5px 7px 3px rgba(0,0,0,0.42))',
        }}
      >
        <BookImg
          src={book.coverUrl}
          alt={book.title}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: coverMaxW,
            aspectRatio: '5 / 7',
            borderRadius: 2,
            display: 'block',
          }}
        />
      </div>
    </div>
  );
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

    /** Stack template: 3 extra stars — sizes vary pseudo-randomly per poster (stable export) */
    const stackYellowSparkles = useMemo(() => {
      if (template !== 'stack') return [] as { x: number; y: number; size: number; opacity: number }[];
      let seed = year * 10007 + month * 1009 + books.length * 503;
      const rnd = () => {
        seed = (seed * 48271) % 2147483647;
        return seed / 2147483647;
      };
      const fixed = [
        { x: 158, y: 198 },
        { x: 418, y: 312 },
        { x: 72, y: 528 },
      ];
      return fixed.map((pos) => ({
        ...pos,
        size: Math.round(20 + rnd() * 36),
        opacity: 0.32 + rnd() * 0.2,
      }));
    }, [template, year, month, books.length]);

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
      borderRadius: 12,
    };

    const emptyState = (
      <p style={{ fontSize: 14, opacity: 0.3, letterSpacing: '0.2em', textAlign: 'center' }}>ADD BOOKS TO PREVIEW</p>
    );

    // ─── GRID ───
    if (template === 'grid') {
      const GRID_FONT = "'DM Sans', system-ui, sans-serif";
      const gridMonthTitle = MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase();
      const firstDay = new Date(year, month, 1).getDay();
      const blanks = Array.from({ length: firstDay });
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      /** Calendar borders + weekday labels + date numbers */
      const gridLine = '#554D4A';
      const weekdayColor = '#554D4A';

      const cellBorder: React.CSSProperties = {
        borderRight: `1px solid ${gridLine}`,
        borderBottom: `1px solid ${gridLine}`,
        boxSizing: 'border-box',
      };

      return (
        <div ref={ref} style={{ ...baseStyle, fontFamily: GRID_FONT }}>
          <p
            style={{
              position: 'absolute',
              top: 80,
              left: 0,
              right: 0,
              zIndex: 0,
              textAlign: 'center',
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-2px',
              color: moodConfig.textColor,
              fontFamily: GRID_FONT,
            }}
          >
            Read in {gridMonthTitle}
          </p>
          <div
            style={{
              position: 'absolute',
              top: 154,
              left: 32,
              right: 32,
              bottom: 32,
              zIndex: 1,
              minHeight: 0,
              overflow: 'auto',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gridAutoRows: 'auto',
                alignContent: 'start',
                width: '100%',
                maxWidth: '100%',
                height: 'fit-content',
                maxHeight: '100%',
                borderLeft: `1px solid ${gridLine}`,
                borderTop: `1px solid ${gridLine}`,
                boxSizing: 'border-box',
              }}
            >
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  style={{
                    ...cellBorder,
                    textAlign: 'center',
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: weekdayColor,
                    padding: '6px 0 8px',
                    fontFamily: GRID_FONT,
                  }}
                >
                  {d}
                </div>
              ))}
              {blanks.map((_, i) => (
                <div key={`b${i}`} style={{ ...cellBorder, aspectRatio: '3/4', minHeight: 0 }} />
              ))}
              {days.map((day) => {
                const book = entries[day];
                return (
                  <div
                    key={day}
                    style={{
                      ...cellBorder,
                      aspectRatio: '3/4',
                      position: 'relative',
                      minHeight: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {book ? (
                      <BookImg src={book.coverUrl} alt={book.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                    ) : (
                      <span
                        style={{
                          position: 'absolute',
                          top: 6,
                          left: 8,
                          fontSize: 10,
                          fontWeight: 500,
                          color: gridLine,
                          fontFamily: GRID_FONT,
                        }}
                      >
                        {day}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // ─── STACK (Creative Collage) ───
    if (template === 'stack') {
      const monthName = MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase();

      /** Safe zone: Tailwind p-6 (24px) — keeps type & covers off the poster edge */
      const STACK_SAFE_PAD = 24;

      // Sparkle SVG — `x`/`y` are always in full poster coordinates (600×750), not the padded safe zone
      const Sparkle = ({ x, y, size = 28, color = '#C8A2C8', opacity = 0.6 }: { x: number; y: number; size?: number; color?: string; opacity?: number }) => (
        <svg style={{ position: 'absolute', left: x, top: y, width: size, height: size, opacity }} viewBox="0 0 24 24" fill={color}>
          <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
        </svg>
      );

      // Layout positions — relative layout inside safe zone; whole group is shifted so its bbox is horizontally centered
      const posterH = 750;
      const innerH = posterH - 2 * STACK_SAFE_PAD;
      const INNER_W = 600 - 2 * STACK_SAFE_PAD;
      const TITLE_TOP_PX = 88;
      const TITLE_FONT_SIZE = 60;
      const TITLE_FONT_FAMILY = "'Playfair Display', Georgia, serif";
      const TITLE_GAP_PX = 28; // keep 28px gap between title and first book

      const getPositions = (count: number) => {
        if (count === 1) {
          return [{ left: '50%', top: '28%', rotate: -3, w: 200, h: 286, centerX: true as const }];
        }
        if (count === 2) {
          return [
            { left: '8%', top: '28%', rotate: -4, w: 170, h: 243 },
            { left: '54%', top: '30%', rotate: 3, w: 170, h: 243 },
          ];
        }
        if (count === 3) {
          return [
            { left: '4%', top: '27%', rotate: -5, w: 150, h: 215 },
            { left: '36%', top: '30%', rotate: 2, w: 150, h: 215 },
            { left: '67%', top: '26%', rotate: -3, w: 150, h: 215 },
          ];
        }
        if (count === 4) {
          return [
            { left: '4%', top: '26%', rotate: -4, w: 130, h: 186 },
            { left: '30%', top: '24%', rotate: 3, w: 130, h: 186 },
            { left: '18%', top: '56%', rotate: 2, w: 130, h: 186 },
            { left: '56%', top: '28%', rotate: -2, w: 130, h: 186 },
          ];
        }
        if (count === 5) {
          return [
            { left: '3%', top: '25%', rotate: -4, w: 120, h: 172 },
            { left: '28%', top: '23%', rotate: 3, w: 120, h: 172 },
            { left: '55%', top: '26%', rotate: -2, w: 120, h: 172 },
            { left: '10%', top: '54%', rotate: 5, w: 120, h: 172 },
            { left: '42%', top: '56%', rotate: -3, w: 120, h: 172 },
          ];
        }
        if (count === 6) {
          return [
            { left: '3%', top: '24%', rotate: -4, w: 110, h: 158 },
            { left: '27%', top: '22%', rotate: 3, w: 110, h: 158 },
            { left: '53%', top: '25%', rotate: -2, w: 110, h: 158 },
            { left: '8%', top: '52%', rotate: 5, w: 110, h: 158 },
            { left: '36%', top: '54%', rotate: -3, w: 110, h: 158 },
            { left: '62%', top: '51%', rotate: 4, w: 110, h: 158 },
          ];
        }

        // count is always ≥ 7 here: 4 covers per row
        const cols = 4;
        const rows = Math.ceil(count / cols);
        let seed = count * 9973 + 17;
        const rnd = () => {
          seed = (seed * 16807) % 2147483647;
          return seed / 2147483647;
        };
        const coverW = Math.max(56, Math.min(102, Math.floor((INNER_W * 0.92) / cols - 8)));
        const coverH = Math.round(coverW * 1.43);
        const rotCycle = [-4, 3, -2, 4, -3, 5, 2, -5, 3, -4];
        const v0 = 19;
        const v1 = 76;
        const band = v1 - v0;
        /** Share of vertical band used from first row center to last — lower = tighter row gaps */
        const rowPack = 0.48;
        const rowSpan = band * rowPack;
        const rowGap = rows <= 1 ? 0 : rowSpan / (rows - 1);
        const rowBlockStart = v0 + (band - rowSpan) / 2;
        const out: Array<{ left: string; top: string; rotate: number; w: number; h: number }> = [];
        const slotW = 88 / cols;
        for (let i = 0; i < count; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const topPct =
            rows <= 1
              ? v0 + band * 0.32 + (rnd() - 0.5) * 2
              : rowBlockStart + row * rowGap + (rnd() - 0.5) * 2;
          const leftPct = 6 + col * slotW + slotW * 0.32 + (rnd() - 0.5) * (slotW * 0.22);
          out.push({
            left: `${Math.max(1, Math.min(82, leftPct))}%`,
            top: `${Math.max(15, Math.min(78, topPct))}%`,
            rotate: rotCycle[i % rotCycle.length] + Math.round((rnd() - 0.5) * 3),
            w: coverW,
            h: coverH,
          });
        }
        return out;
      };

      // Adaptive font size: smaller when more books
      const titleFontSize =
        books.length <= 3 ? 11 : books.length <= 5 ? 10 : books.length <= 8 ? 9 : books.length <= 14 ? 8 : 7;

      const positions = getPositions(books.length);
      const titleBottomPx =
        TITLE_TOP_PX +
        TITLE_FONT_SIZE * 1.1 +
        TITLE_FONT_SIZE * 1.05 +
        -2; // matches marginTop: -2 on second line

      const minBookTopPx =
        positions.length === 0
          ? 0
          : Math.min(...positions.map((p) => (Number.parseFloat(p.top) / 100) * innerH));
      const yShiftPx = titleBottomPx + TITLE_GAP_PX - minBookTopPx;

      const displayed = books;
      const stackCollageOffsetPx = (() => {
        let minL = Infinity;
        let maxR = -Infinity;
        for (let i = 0; i < displayed.length; i++) {
          const pos = positions[i];
          if (!pos) continue;
          if ('centerX' in pos && pos.centerX) {
            const half = pos.w / 2;
            minL = Math.min(minL, INNER_W / 2 - half);
            maxR = Math.max(maxR, INNER_W / 2 + half);
          } else {
            const pct = Number.parseFloat(pos.left);
            if (Number.isNaN(pct)) continue;
            const leftPx = (pct / 100) * INNER_W;
            minL = Math.min(minL, leftPx);
            maxR = Math.max(maxR, leftPx + pos.w);
          }
        }
        if (!Number.isFinite(minL)) return 0;
        return INNER_W / 2 - (minL + maxR) / 2;
      })();

      return (
        <div ref={ref} style={{ ...baseStyle, backgroundColor: '#F5F3EE' }}>
          {/* Paper texture overlay — full bleed */}
          <img src={paperTexture} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, mixBlendMode: 'multiply' }} />

          {/* Sparkles: full-poster layer — independent of safe-zone padding (600×750 px space) */}
          <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
            <Sparkle x={50} y={15} size={56} color="#D4A0D4" opacity={0.5} />
            <Sparkle x={340} y={5} size={42} color="#A8D8A8" opacity={0.45} />
            <Sparkle x={500} y={40} size={36} color="#A8D8A8" opacity={0.35} />
            <Sparkle x={530} y={600} size={48} color="#D4A0D4" opacity={0.35} />
            <Sparkle x={20} y={670} size={38} color="#A8D8A8" opacity={0.4} />
            <Sparkle x={280} y={680} size={32} color="#D4A0D4" opacity={0.3} />
            <Sparkle x={440} y={350} size={28} color="#A8D8A8" opacity={0.25} />
            <Sparkle x={10} y={380} size={34} color="#D4A0D4" opacity={0.28} />
            {stackYellowSparkles.map((s, i) => (
              <Sparkle key={`y${i}`} x={s.x} y={s.y} size={s.size} color="#F9E79F" opacity={s.opacity} />
            ))}
          </div>

          {/* Safe zone: type & covers; sparkles sit under this layer but use full poster coordinates */}
          <div className="absolute inset-6 z-[5] overflow-visible">
            {/* Title section */}
            <div style={{ position: 'absolute', top: TITLE_TOP_PX, left: 0, right: 0, textAlign: 'center', zIndex: 30 }}>
              <p style={{ fontFamily: TITLE_FONT_FAMILY, fontStyle: 'italic', fontSize: TITLE_FONT_SIZE, fontWeight: 500, color: '#2B3A67', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                what I read
              </p>
              <p style={{ fontFamily: TITLE_FONT_FAMILY, fontSize: TITLE_FONT_SIZE, fontWeight: 700, color: '#2B3A67', lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: -2 }}>
                in {monthName}
              </p>
            </div>

            {/* Book covers */}
            {books.length === 0 ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 13, opacity: 0.25, letterSpacing: '0.15em', color: '#2C2C2C', fontFamily: "'Inter', sans-serif" }}>ADD BOOKS TO PREVIEW</p>
              </div>
            ) : (
              <div
                className="pointer-events-none absolute left-1/2 top-0 h-full w-full"
                style={{ transform: `translateX(calc(-50% + ${stackCollageOffsetPx}px))` }}
              >
                {displayed.map((book, i) => {
                  const pos = positions[i]!;
                  const anchorCenter = 'centerX' in pos && pos.centerX === true;
                  return (
                    <div key={book.key} style={{
                      position: 'absolute',
                      left: anchorCenter ? '50%' : pos.left,
                      top: `calc(${pos.top} + ${yShiftPx}px)`,
                      transform: anchorCenter ? `translateX(-50%) rotate(${pos.rotate}deg)` : `rotate(${pos.rotate}deg)`,
                      zIndex: 10 + i * 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: 4,
                    }}>
                      <div style={{ boxShadow: '0 3px 12px rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                        <BookImg src={book.coverUrl} alt={book.title} style={{ width: pos.w, height: pos.h }} />
                      </div>
                      <p style={{
                        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
                        fontSize: titleFontSize,
                        color: '#2C2C2C',
                        opacity: 0.65,
                        marginTop: 6,
                        textAlign: 'center',
                        maxWidth: pos.w,
                        lineHeight: 1.3,
                        whiteSpace: 'normal',
                        overflow: 'visible',
                        wordBreak: 'break-word',
                        position: 'relative',
                        zIndex: 10 + i * 2 + 1,
                        padding: '1px 4px',
                        borderRadius: 2,
                      }}>
                        {book.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Small decorative arrows between items */}
            <svg className="absolute left-1/2 top-1/2 z-[5] h-4 w-4 -translate-x-1/2 -translate-y-1/2 opacity-20" viewBox="0 0 24 24" fill="none" stroke="#2C2C2C" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>

            {/* Year small text */}
            <p className="absolute bottom-3 right-4 z-[30] text-xs tracking-widest text-[#2C2C2C]/25" style={{ fontFamily: "'Inter', sans-serif" }}>{year}</p>
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
                      maxHeight: '90%',
                      padding: '8px 0',
                      whiteSpace: 'normal',
                      overflow: 'visible',
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

    // ─── INSIGHT CALENDAR: hand-drawn doodle grid (Griun Cocochoitoon) ───
    if (template === 'calendar') {
      const firstDay = new Date(year, month, 1).getDay();
      const blanks2 = Array.from({ length: firstDay });
      const days2 = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      /** Only rows that include at least one day cell (no trailing empty week row) */
      const rowCount =
        daysInMonth > 0 ? Math.floor((firstDay + daysInMonth - 1) / 7) + 1 : 1;

      const doodlePaper = '#FDFCFA';
      const doodleInk = '#141414';
      const gx = 26;
      /** Header row ~54px from top:32; keep ~half the previous gap (36→18) to month label */
      const gy = 104;
      const gw = 600 - gx * 2;
      const weekH = 30;
      const rowH = CALENDAR_DATE_ROW_H_PX;
      /** Clip grid/doodle to real rows */
      const gh = weekH + rowCount * rowH;
      const gridSeed = year * 1000 + month * 31 + rowCount;
      const doodleLines = buildInsightDoodleGridLines({
        gx,
        gy,
        gw,
        gh,
        weekH,
        rowCount,
        rowH,
        seed: gridSeed,
      });
      const yearOvalW = 92;
      const yearOvalH = 46;
      const yearOvalPath = wobbleOvalPath(
        yearOvalW / 2,
        yearOvalH / 2,
        42,
        18,
        gridSeed + 888,
        52,
        0.48,
      );

      return (
        <div
          ref={ref}
          style={{
            width: 600,
            aspectRatio: '4/5',
            backgroundColor: doodlePaper,
            color: doodleInk,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 12,
            fontFamily: CALENDAR_POSTER_FONT,
          }}
        >
          <svg
            width={600}
            height={750}
            style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 0 }}
            aria-hidden
          >
            {doodleLines.map((line, i) => (
              <path
                key={i}
                d={line.d}
                fill="none"
                stroke={doodleInk}
                strokeWidth={line.sw}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>

          <div
            style={{
              position: 'absolute',
              top: 32,
              left: gx,
              right: gx,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span
              style={{
                fontSize: 54,
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {MONTHS_SHORT[month]}
            </span>
            <div style={{ position: 'relative', width: yearOvalW, height: yearOvalH, flexShrink: 0 }}>
              <svg
                width={yearOvalW}
                height={yearOvalH}
                style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
                aria-hidden
              >
                <path d={yearOvalPath} fill="none" stroke={doodleInk} strokeWidth={doodleStrokeWidth(gridSeed + 999)} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  textAlign: 'center',
                  fontSize: 25,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {year}
              </span>
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              left: gx,
              top: gy,
              width: gw,
              height: gh,
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridTemplateRows: `${weekH}px repeat(${rowCount}, ${rowH}px)`,
              alignContent: 'start',
              zIndex: 1,
              boxSizing: 'border-box',
            }}
          >
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  color: doodleInk,
                  opacity: 0.9,
                  padding: '0 5px 2px',
                }}
              >
                {d}
              </div>
            ))}
            {blanks2.map((_, i) => (
              <div key={`b${i}`} style={{ minHeight: 0 }} />
            ))}
            {days2.map((day) => {
              const book = entries[day];
              return (
                <div
                  key={day}
                  style={{
                    minHeight: 0,
                    minWidth: 0,
                    padding: '6px 5px 7px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    boxSizing: 'border-box',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      alignSelf: 'flex-start',
                      width: 'fit-content',
                      maxWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        lineHeight: 1.1,
                        color: doodleInk,
                        opacity: 1,
                        whiteSpace: 'nowrap',
                        minWidth: 'min-content',
                      }}
                    >
                      {day}
                    </span>
                    <div
                      style={{
                        marginTop: 3,
                        height: 0,
                        borderBottom: `1.5px solid ${doodleInk}`,
                        width: '100%',
                        opacity: 0.92,
                      }}
                    />
                  </div>
                  {book ? (
                    <>
                      <div
                        style={{
                          flex: 1,
                          minHeight: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px 0 2px',
                        }}
                      >
                        <CalendarOpenBookIcon color={doodleInk} seed={gridSeed + day * 97} />
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 9,
                          lineHeight: 1.25,
                          color: doodleInk,
                          fontWeight: 400,
                          textAlign: 'center',
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical' as const,
                          flexShrink: 0,
                        }}
                      >
                        {book.title}
                      </p>
                    </>
                  ) : (
                    <div style={{ flex: 1, minHeight: 0 }} />
                  )}
                </div>
              );
            })}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '0 28px 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              zIndex: 2,
              fontSize: 12,
              color: doodleInk,
              opacity: 0.55,
            }}
          >
            <span>monthly recap</span>
            <span>
              {readDays} / {daysInMonth} read days
            </span>
          </div>
        </div>
      );
    }

    // ─── BOLD TYPOGRAPHY: Text-as-design poster ───
    if (template === 'typography') {
      const monthName = MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase();
      const connectors = ['read', 'and', 'with', 'also', 'then'];

      // Sticker-like book cover positions scattered among text
      const stickerPositions = [
        { right: 20, top: '18%', rotate: 6, size: 62 },
        { right: 60, top: '42%', rotate: -8, size: 56 },
        { left: 10, top: '58%', rotate: 10, size: 50 },
        { right: 30, top: '68%', rotate: -5, size: 58 },
        { left: 40, top: '36%', rotate: 7, size: 48 },
        { right: 10, top: '82%', rotate: -4, size: 52 },
      ];

      // Decorative SVG elements
      const Barcode = ({ x, y }: { x: number; y: number }) => (
        <div style={{ position: 'absolute', left: x, top: y, zIndex: 5, opacity: 0.7 }}>
          <div style={{ display: 'flex', gap: 1, height: 22 }}>
            {[3,2,1,3,1,2,3,1,2,1,3,2,1,2,3,1].map((w, i) => (
              <div key={i} style={{ width: w, height: '100%', backgroundColor: '#C8FF00' }} />
            ))}
          </div>
          <p style={{ fontSize: 6, letterSpacing: '0.1em', color: '#999', marginTop: 1, fontFamily: "'Space Mono', monospace" }}>4 902137 891023</p>
        </div>
      );

      const Ticket = ({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) => (
        <div style={{
          position: 'absolute', left: x, top: y, zIndex: 6,
          width: 42, height: 22,
          backgroundColor: '#C8FF00',
          borderRadius: 3,
          transform: `rotate(${rotate}deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontSize: 5, fontWeight: 700, letterSpacing: '0.08em', color: '#1A1A1A', fontFamily: "'Space Mono', monospace" }}>ADMIT ONE</p>
        </div>
      );

      const Seal = ({ x, y, size = 36 }: { x: number; y: number; size?: number }) => (
        <svg style={{ position: 'absolute', left: x, top: y, width: size, height: size, zIndex: 6 }} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#C8FF00" strokeWidth="2" />
          <circle cx="20" cy="20" r="13" fill="none" stroke="#C8FF00" strokeWidth="1" />
          <text x="20" y="22" textAnchor="middle" fontSize="6" fontWeight="700" fill="#C8FF00" fontFamily="'Space Mono', monospace">READ</text>
        </svg>
      );

      // Calculate font sizes based on book count
      const baseFontSize = books.length <= 2 ? 72 : books.length <= 4 ? 58 : 48;

      return (
        <div ref={ref} style={{ ...baseStyle, backgroundColor: '#FFFFFF', color: '#1A1A1A' }}>
          {/* Main typography area */}
          <div style={{
            position: 'absolute', left: 28, right: 28, top: 32, bottom: 70,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            {books.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 14, opacity: 0.2, letterSpacing: '0.15em' }}>ADD BOOKS TO PREVIEW</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {books.slice(0, 6).map((book, i) => {
                  const fontSize = Math.max(baseFontSize - i * 4, 36);
                  const connector = connectors[i % connectors.length];
                  const isKorean = /[가-힣]/.test(book.title);
                  return (
                    <div key={book.key} style={{ position: 'relative' }}>
                      {/* Connector word between titles */}
                      {i > 0 && (
                        <p style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontStyle: 'italic',
                          fontSize: 14,
                          color: '#999',
                          marginBottom: -4,
                          marginTop: -2,
                          letterSpacing: '0.05em',
                        }}>
                          {connector}
                        </p>
                      )}
                      {/* Book title — huge and bold */}
                      <p style={{
                        fontFamily: isKorean
                          ? "'Pretendard', 'Noto Sans KR', sans-serif"
                          : "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                        fontSize,
                        fontWeight: 900,
                        lineHeight: 0.92,
                        letterSpacing: '-0.03em',
                        color: '#1A1A1A',
                        textTransform: isKorean ? 'none' : 'none',
                        wordBreak: 'keep-all',
                        whiteSpace: 'normal',
                        overflow: 'visible',
                        marginBottom: 2,
                      }}>
                        {book.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Book covers as stickers scattered over text */}
          {books.slice(0, 6).map((book, i) => {
            const pos = stickerPositions[i];
            if (!pos) return null;
            return (
              <div key={`sticker-${book.key}`} style={{
                position: 'absolute',
                ...(pos.left !== undefined ? { left: pos.left } : {}),
                ...(pos.right !== undefined ? { right: pos.right } : {}),
                top: pos.top,
                transform: `rotate(${pos.rotate}deg)`,
                zIndex: 8,
                border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <BookImg src={book.coverUrl} alt={book.title} style={{ width: pos.size, height: pos.size * 1.4 }} />
              </div>
            );
          })}

          {/* Decorative accents */}
          <Barcode x={380} y={28} />
          <Ticket x={28} y={20} rotate={-3} />
          <Seal x={480} y={520} size={44} />
          <Seal x={20} y={440} size={30} />
          <Ticket x={420} y={380} rotate={8} />

          {/* Bottom info */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '0 28px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          }}>
            <div>
              <p style={{ fontSize: 8, letterSpacing: '0.2em', opacity: 0.35, fontFamily: "'Space Mono', monospace" }}>RECAP BY VISCAP</p>
              <p style={{ fontSize: 8, letterSpacing: '0.15em', opacity: 0.35, fontFamily: "'Space Mono', monospace", marginTop: 2 }}>{MONTHS[month]} {year}</p>
            </div>
            <p style={{ fontSize: 8, opacity: 0.25, fontFamily: "'Space Mono', monospace" }}>{books.length} BOOKS · {readDays} DAYS</p>
          </div>
        </div>
      );
    }

    // ─── MOSAIC: colored cells, covers only; grid shape follows book count ───
    if (template === 'mosaic') {
      const { cols, rows } = mosaicGridDims(books.length);
      const cellCount = cols * rows;
      const slots = Array.from({ length: cellCount }, (_, i) => books[i] ?? null);
      const coverBase = Math.min(300, Math.max(88, Math.floor(598 / cols)));
      const coverMaxW = Math.round(coverBase * 2.72 * 1.5);

      return (
        <div ref={ref} style={{ ...baseStyle, padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: 0,
            }}
          >
            {slots.map((book, i) =>
              book ? (
                <MosaicBookCell
                  key={book.key}
                  book={book}
                  cols={cols}
                  coverMaxW={coverMaxW}
                  fallbackBg={MOSAIC_FALLBACK_COLORS[i % MOSAIC_FALLBACK_COLORS.length]}
                />
              ) : (
                <div
                  key={`empty-${i}`}
                  style={{
                    backgroundColor: MOSAIC_FALLBACK_COLORS[i % MOSAIC_FALLBACK_COLORS.length],
                    minHeight: 0,
                    minWidth: 0,
                  }}
                />
              )
            )}
          </div>
          {books.length === 0 ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div style={{ backgroundColor: 'rgba(255,255,255,0.88)', padding: '12px 20px', borderRadius: 8 }}>{emptyState}</div>
            </div>
          ) : null}
        </div>
      );
    }

    // fallback
    return <div ref={ref} style={baseStyle}>{emptyState}</div>;
  }
);

PosterCanvas.displayName = 'PosterCanvas';
