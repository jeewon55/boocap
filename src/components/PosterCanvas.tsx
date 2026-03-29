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

/** Closed path: wobbly rectangle in local coords (e.g. viewBox 0 0 100 100) for filled sticker */
function wobblyStickerRectPath(w: number, h: number, seed: number): string {
  const amp = Math.min(w, h) * 0.042;
  const inset = Math.min(w, h) * 0.035;
  const x0 = inset;
  const y0 = inset;
  const x1 = w - inset;
  const y1 = h - inset;
  const seg = 5;
  const samples = (
    ax: number,
    ay: number,
    bx: number,
    by: number,
    ox: number,
    oy: number,
    k: number,
  ): [number, number][] => {
    const pts: [number, number][] = [];
    for (let s = 0; s <= seg; s++) {
      const t = s / seg;
      const px = ax + (bx - ax) * t;
      const py = ay + (by - ay) * t;
      const r = fract01(seed * 5.31 + k * 29 + s * 11.7);
      const wob = (r - 0.5) * amp * 2.35;
      pts.push([px + ox * wob, py + oy * wob]);
    }
    return pts;
  };
  const e1 = samples(x0, y0, x1, y0, 0, -1, 1);
  const e2 = samples(x1, y0, x1, y1, 1, 0, 2);
  const e3 = samples(x1, y1, x0, y1, 0, 1, 3);
  const e4 = samples(x0, y1, x0, y0, -1, 0, 4);
  const all = [...e1, ...e2.slice(1), ...e3.slice(1), ...e4.slice(1)];
  return `M ${all.map(([a, b]) => `${a.toFixed(2)} ${b.toFixed(2)}`).join(' L ')} Z`;
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

    /** Reading days sorted (capsule template). */
    const readsSortedByDay = useMemo(
      () =>
        Object.entries(entries)
          .filter(([, b]) => b)
          .map(([d, b]) => ({ day: Number(d), book: b as Book }))
          .sort((a, b) => a.day - b.day),
      [entries],
    );

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
                        letterSpacing: '-0.02em',
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
      const listMonthTitle =
        MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase();
      return (
        <div ref={ref} style={baseStyle}>
          <div style={{ position: 'absolute', top: 0, left: 0, padding: 32, textAlign: 'left' }}>
            <p
              style={{
                fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {year} {listMonthTitle}
            </p>
          </div>
          <div style={{ position: 'absolute', left: 32, right: 32, top: 160, bottom: 80 }}>
            {books.length === 0 ? emptyState : books.slice(0, 7).map((book, i) => (
              <div key={book.key} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 700, opacity: 0.1, minWidth: 50 }}>{String(i + 1).padStart(2, '0')}</span>
                <BookImg src={book.coverUrl} alt={book.title} style={{ width: 52, height: 75, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.3 }}>{book.title}</p>
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

    // ─── TIME-LINE SCATTER: newsletter dividers + vertical timeline + zigzag labels ───
    if (template === 'timeline') {
      const listMonthTitle =
        MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase();
      const pad = 32;
      const ink = moodConfig.textColor;
      const lineHeavy = 4;
      /** Same vertical size as baseStyle 600×(4/5) canvas */
      const posterHeight = 750;
      const scatterFont = "'Pretendard', 'Noto Sans KR', sans-serif";
      const reads = readsSortedByDay;

      /** Vertical timeline — horizontal center of 600px canvas */
      const lineX = 300;
      /** Horizontal connectors start past on-spine date numerals */
      const spineClearance = 13;
      /** Keep dashed arms short of the title column (same formula as `gapFromLine` below). */
      const dashTextGap = 4;
      /** Track below two-line title (no divider under header) */
      const trackTop = 132;
      const trackBottom = posterHeight - 86;
      const trackH = Math.max(120, trackBottom - trackTop);

      const dayY = (d: number) => {
        if (daysInMonth <= 1) return trackTop + trackH / 2;
        return trackTop + ((d - 1) / (daysInMonth - 1)) * trackH;
      };

      /** One anchor per calendar day on the spine (same y if multiple books that day). */
      const spineStops = [...new Map(reads.map((r) => [r.day, dayY(r.day)])).entries()]
        .map(([day, y]) => ({ day, y }))
        .sort((a, b) => a.y - b.y);

      const desiredGapHalf = 9;
      const verticalSpineSegments: { y1: number; y2: number }[] = (() => {
        if (spineStops.length === 0) {
          return [{ y1: trackTop, y2: trackBottom }];
        }
        const segs: { y1: number; y2: number }[] = [];
        let cursor = trackTop;
        for (let i = 0; i < spineStops.length; i++) {
          const { y } = spineStops[i];
          const prevY = i === 0 ? trackTop : spineStops[i - 1].y;
          const nextY = i === spineStops.length - 1 ? trackBottom : spineStops[i + 1].y;
          const spaceAbove = y - prevY;
          const spaceBelow = nextY - y;
          const halfUp = Math.min(desiredGapHalf, Math.max(2.5, spaceAbove / 2 - 0.5));
          const halfDown = Math.min(desiredGapHalf, Math.max(2.5, spaceBelow / 2 - 0.5));
          const segEnd = y - halfUp;
          if (segEnd > cursor + 0.5) {
            segs.push({ y1: cursor, y2: segEnd });
          }
          cursor = y + halfDown;
        }
        if (trackBottom > cursor + 0.5) {
          segs.push({ y1: cursor, y2: trackBottom });
        }
        return segs;
      })();

      return (
        <div ref={ref} style={{ ...baseStyle, textAlign: 'left' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: pad,
              paddingBottom: 10,
              boxSizing: 'border-box',
            }}
          >
            <p
              style={{
                fontFamily: scatterFont,
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                margin: 0,
                color: ink,
              }}
            >
              {listMonthTitle}
              <br />
              {year}
            </p>
          </div>

          <svg
            width={600}
            height={posterHeight}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
            aria-hidden
          >
            {verticalSpineSegments.map((seg, si) => (
              <line
                key={`spine-${si}`}
                x1={lineX}
                y1={seg.y1}
                x2={lineX}
                y2={seg.y2}
                stroke={ink}
                strokeWidth={lineHeavy}
                strokeLinecap="butt"
              />
            ))}
            {spineStops.map(({ day, y }) => (
              <text
                key={`spine-day-${day}`}
                x={lineX}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={ink}
                style={{
                  fontFamily: scatterFont,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                {day}
              </text>
            ))}
            {reads.map((r, i) => {
              const y = dayY(r.day);
              const isRight = i % 2 === 0;
              const sameSideBefore = reads.slice(0, i).filter((_, j) => (j % 2 === 0) === isRight).length;
              const stackShift = sameSideBefore * 36;
              const dashLen = 44 + stackShift;
              const gapFromLine = 12 + stackShift + spineClearance;
              let x1: number;
              let x2: number;
              if (isRight) {
                x1 = lineX + spineClearance;
                x2 = Math.min(lineX + dashLen, lineX + gapFromLine - dashTextGap);
                if (x2 <= x1 + 2) x2 = x1 + 2;
              } else {
                x1 = lineX - dashLen;
                x2 = lineX - gapFromLine - dashTextGap;
                if (x2 <= x1 + 2) x1 = x2 - 2;
              }
              return (
                <g key={`${r.day}-${r.book.key}`}>
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke={ink}
                    strokeWidth={1}
                    strokeDasharray="3 5"
                    opacity={0.45}
                  />
                </g>
              );
            })}
          </svg>

          {reads.map((r, i) => {
            const y = dayY(r.day);
            const isRight = i % 2 === 0;
            const sameSideBefore = reads.slice(0, i).filter((_, j) => (j % 2 === 0) === isRight).length;
            const stackShift = sameSideBefore * 36;
            const gapFromLine = 12 + stackShift + spineClearance;
            const blockStyle: React.CSSProperties = {
              position: 'absolute',
              top: y,
              transform: 'translateY(-50%)',
              textAlign: isRight ? 'left' : 'right',
              boxSizing: 'border-box',
            };
            if (isRight) {
              blockStyle.left = lineX + gapFromLine;
              blockStyle.width = Math.min(268, 600 - pad - (lineX + gapFromLine));
            } else {
              const w = Math.min(248, lineX - gapFromLine - pad);
              blockStyle.left = lineX - gapFromLine - w;
              blockStyle.width = w;
            }
            return (
              <div key={`txt-${r.day}-${r.book.key}`} style={blockStyle}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: scatterFont,
                    fontSize: 17,
                    fontWeight: 800,
                    lineHeight: 1.12,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                    color: ink,
                    wordBreak: 'break-word',
                  }}
                >
                  {r.book.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    marginTop: 5,
                    fontFamily: scatterFont,
                    fontSize: 9,
                    fontWeight: 500,
                    lineHeight: 1.35,
                    letterSpacing: '-0.01em',
                    color: ink,
                    opacity: 0.52,
                  }}
                >
                  {r.book.author}
                </p>
              </div>
            );
          })}
        </div>
      );
    }

    // ─── CAPSULE LIST: half-pill border, # | title (wrap) ───
    if (template === 'capsule') {
      const capsuleFont = "'Instrument Sans', 'Noto Sans KR', sans-serif";
      const capsuleHeadNumFont = "'Pretendard', 'Noto Sans KR', sans-serif";
      const padY = 30;
      const n = readsSortedByDay.length;
      const gap = n <= 5 ? 12 : n <= 9 ? 9 : n <= 14 ? 7 : 6;
      const capsuleMinH = 60;
      const capsuleDefaultH = 100;
      const capsuleNumColW = 64;
      const titleFontPx = 28;
      const numFs = 38;

      return (
        <div
          ref={ref}
          style={{
            ...baseStyle,
            padding: `${padY}px 26px`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          <p
            style={{
              flexShrink: 0,
              margin: 0,
              marginBottom: 14,
              fontFamily: capsuleHeadNumFont,
              fontSize: 48,
              fontWeight: 600,
              letterSpacing: '-0.5px',
              color: moodConfig.textColor,
              textAlign: 'left',
              lineHeight: '64px',
            }}
          >
            {n} BOOKS
            <br />
            READ IN {MONTHS_SHORT[month].toUpperCase()}
          </p>
          {n === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{emptyState}</div>
          ) : (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap,
              }}
            >
              {readsSortedByDay.map(({ day, book }, i) => (
                <div
                  key={`${day}-${book.key}`}
                  style={{
                    boxSizing: 'border-box',
                    minHeight: capsuleMinH,
                    height: capsuleDefaultH,
                    border: '4px solid #000',
                    borderRadius: '9999px 0 0 9999px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'stretch',
                    width: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      boxSizing: 'border-box',
                      width: capsuleNumColW,
                      minWidth: capsuleNumColW,
                      maxWidth: capsuleNumColW,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 4px',
                      fontFamily: capsuleHeadNumFont,
                      fontSize: numFs,
                      fontWeight: 800,
                      lineHeight: 1,
                      color: '#000',
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      width: 0,
                      borderLeft: '2px solid #000',
                      alignSelf: 'stretch',
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: '12px 16px 12px 12px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: capsuleFont,
                        fontSize: titleFontPx,
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        color: '#000',
                        lineHeight: 1.25,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        display: 'block',
                        width: '100%',
                      }}
                    >
                      {book.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                    <div
                      style={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        padding: '6px 0 2px',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          maxWidth: '100%',
                        }}
                      >
                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          aria-hidden
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                          }}
                        >
                          <path
                            d={wobblyStickerRectPath(100, 100, gridSeed + day * 131)}
                            fill="#141414"
                          />
                        </svg>
                        <p
                          style={{
                            margin: 0,
                            position: 'relative',
                            zIndex: 1,
                            fontSize: 9,
                            lineHeight: 1.25,
                            letterSpacing: '-0.02em',
                            color: '#fff',
                            fontWeight: 400,
                            textAlign: 'center',
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical' as const,
                            padding: '8px 7px',
                          }}
                        >
                          {book.title}
                        </p>
                      </div>
                    </div>
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
