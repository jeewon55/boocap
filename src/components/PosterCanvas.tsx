import { forwardRef, useEffect, useMemo, useState } from 'react';
import type { Locale } from '@/contexts/LocaleContext';
import {
  posterGrid2MonthLine,
  posterGrid2Subtitle,
  posterListHeaderMonthYear,
  posterTimelineVerticalLabel,
} from '@/i18n/posterStrings';
import { Book, MOODS, MoodType, TemplateType } from '@/types/book';
import { getPaleDominantCoverBackground, mosaicBackdropIfNearlyWhite } from '@/lib/mosaicCoverColor';
import { buildCalendarWeekRows, twoDigitDay, WEEK_LETTERS_MON } from '@/lib/calendarGrid';
import paperTexture from '@/assets/paper-texture.jpg';

/**
 * Cover URL for <img src>. We use the original URL so pasted / manual URLs and CDNs
 * render in the browser. Routing through an image proxy breaks many sources when the
 * proxy cannot fetch them (while the browser often can with referrerPolicy).
 */
function makeCoverUrl(src: string): string {
  return typeof src === 'string' ? src.trim() : src;
}

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

interface PosterCanvasProps {
  year: number;
  month: number;
  entries: Record<number, Book>;
  mood: MoodType;
  template?: TemplateType;
  /** Month labels & template chrome (e.g. “Reading Journey”) — book text comes from `entries`. */
  posterLocale?: Locale;
}

const BookImg = ({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) => (
  <div
    role="img"
    aria-label={alt}
    style={{
      backgroundImage: `url("${makeCoverUrl(src)}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      ...style,
    }}
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

/** Mosaic covers stay ≤1 so they never spill past padded inset (drop-shadow only). */
const MOSAIC_COVER_DISPLAY_SCALE = 1;

function MosaicBookCell({
  book,
  coverMaxW,
  coverMaxH,
  fallbackBg,
  padX,
  padY,
  displayScale = MOSAIC_COVER_DISPLAY_SCALE,
}: {
  book: Book;
  coverMaxW: number;
  coverMaxH: number;
  fallbackBg: string;
  padX: number;
  padY: number;
  displayScale?: number;
}) {
  const [bg, setBg] = useState(fallbackBg);

  useEffect(() => {
    setBg(fallbackBg);
    let cancelled = false;
    getPaleDominantCoverBackground(book.coverUrl).then((c) => {
      if (!cancelled && c) setBg(mosaicBackdropIfNearlyWhite(c));
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
        padding: `${padY}px ${padX}px`,
        boxSizing: 'border-box',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.18))' }}>
        <BookImg
          src={book.coverDataUrl ?? book.coverUrl}
          alt={book.title}
          style={{
            width: coverMaxW,
            height: coverMaxH,
            borderRadius: 2,
            display: 'block',
            transform: `scale(${displayScale})`,
            transformOrigin: 'center center',
          }}
        />
      </div>
    </div>
  );
}

export const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  ({ year, month, entries, mood, template = 'stack', posterLocale = 'en' }, ref) => {
    const moodConfig = MOODS.find((m) => m.id === mood)!;
    const books = useMemo(() => {
      const seen = new Map<string, Book>();
      Object.values(entries).forEach((b) => {
        if (b) {
          const k = b.title.trim().toLowerCase();
          if (!seen.has(k)) seen.set(k, b);
        }
      });
      return Array.from(seen.values());
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

    /** Same list but with duplicate books removed — used in templates that don't show dates.
     *  Deduplicates by title (normalized) so that the same book searched twice still merges. */
    const readsSortedByDayUnique = useMemo(() => {
      const seen = new Set<string>();
      return readsSortedByDay.filter(({ book }) => {
        const dedupKey = book.title.trim().toLowerCase();
        if (seen.has(dedupKey)) return false;
        seen.add(dedupKey);
        return true;
      });
    }, [readsSortedByDay]);

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

    // ─── GRID (Monthly Calendar): same structure as Step1 “Mark Your Days” — Monday-first, horizontal rules only, two-digit dates
    if (template === 'grid') {
      const weekRows = buildCalendarWeekRows(year, month);
      const monthShort = MONTHS_SHORT[month];
      const fg = moodConfig.textColor;
      const darkPoster = mood === 'dark' || mood === 'bold';
      const rowBorder = darkPoster ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)';
      const weekdayMuted = darkPoster ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
      const adjacentDayColor = darkPoster ? 'rgba(255,255,255,0.32)' : '#d6d6d6';
      const displayFont = 'var(--font-display), system-ui, sans-serif';
      const bodyFont = 'var(--font-body), system-ui, sans-serif';
      /** Narrower than 32+32 so 6 week rows × 3:4 cells fit without clipping (600 canvas). */
      const GRID_INSET_X = 46;
      const GRID_INSET_BOTTOM = 26;
      /** Month + year → calendar gap (~1.5× prior spacing vs header bottom). */
      const gridTop = 103;

      return (
        <div ref={ref} style={{ ...baseStyle, fontFamily: bodyFont }}>
          <div
            style={{
              position: 'absolute',
              top: 28,
              left: GRID_INSET_X,
              right: GRID_INSET_X,
              zIndex: 0,
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '100%',
                minWidth: 0,
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                padding: '6px 4px 2px',
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  flex: '1 1 auto',
                  minWidth: 0,
                  textAlign: 'left',
                  fontFamily: displayFont,
                  fontWeight: 900,
                  letterSpacing: 0,
                  color: fg,
                  lineHeight: 0.82,
                  fontSize: 50,
                }}
              >
                {monthShort}
              </span>
              <span
                style={{
                  flexShrink: 0,
                  alignSelf: 'baseline',
                  fontFamily: '"SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 34,
                  fontWeight: 900,
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                  letterSpacing: -2,
                  color: fg,
                }}
              >
                {year}
              </span>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              top: gridTop,
              left: GRID_INSET_X,
              right: GRID_INSET_X,
              bottom: GRID_INSET_BOTTOM,
              zIndex: 1,
              minHeight: 0,
              overflow: 'hidden',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                width: '100%',
                borderBottom: `1px solid ${rowBorder}`,
                padding: '0 2px 6px',
                boxSizing: 'border-box',
              }}
            >
              {WEEK_LETTERS_MON.map(({ letter, title }) => (
                <div
                  key={title}
                  style={{
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: weekdayMuted,
                    fontFamily: bodyFont,
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>

            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: bodyFont }}>
              {weekRows.map((row, ri) => (
                <div
                  key={`w-${ri}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    width: '100%',
                    flexShrink: 0,
                    borderBottom: ri < weekRows.length - 1 ? `1px solid ${rowBorder}` : undefined,
                    boxSizing: 'border-box',
                  }}
                >
                  {row.map((cell, ci) => {
                    if (cell.scope === 'adjacent') {
                      return (
                        <div
                          key={`adj-${ri}-${ci}`}
                          style={{
                            aspectRatio: '3 / 4',
                            minHeight: 0,
                            minWidth: 0,
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            padding: 6,
                            boxSizing: 'border-box',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: displayFont,
                              fontSize: 22,
                              fontWeight: 700,
                              fontVariantNumeric: 'tabular-nums',
                              lineHeight: 1,
                              letterSpacing: '-0.02em',
                              color: adjacentDayColor,
                            }}
                          >
                            {twoDigitDay(cell.day)}
                          </span>
                        </div>
                      );
                    }
                    const day = cell.day;
                    const book = entries[day];
                    return (
                      <div
                        key={`day-${day}`}
                        style={{
                          aspectRatio: '3 / 4',
                          minHeight: 0,
                          minWidth: 0,
                          position: 'relative',
                          overflow: book ? 'hidden' : 'visible',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: book ? 'stretch' : 'flex-start',
                          justifyContent: book ? 'stretch' : 'flex-start',
                          padding: book ? 0 : 6,
                          boxSizing: 'border-box',
                        }}
                      >
                        {book ? (
                          <BookImg
                            src={book.coverDataUrl ?? book.coverUrl}
                            alt={book.title}
                            style={{ position: 'absolute', inset: '-1px' }}
                          />
                        ) : (
                          <span
                            style={{
                              fontFamily: displayFont,
                              fontSize: 22,
                              fontWeight: 700,
                              fontVariantNumeric: 'tabular-nums',
                              lineHeight: 1,
                              letterSpacing: '-0.02em',
                              color: fg,
                            }}
                          >
                            {twoDigitDay(day)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ─── GRID 2: borderless editorial calendar (date → cover per cell) ───
    if (template === 'grid2') {
      const GRID2_FONT = "'DM Sans', system-ui, sans-serif";
      const GRID2_TEXT = '#313131';
      const GRID2_OUT_MONTH_DATE = '#C8C8C8';
      /** Two-line title (month + “Reading Journey”, 64px × 2, line-height 1) + year row */
      const GRID2_HEADER_TOP = 16;
      /** Lower = more vertical space for calendar (title minHeight still ties to this). */
      const GRID2_GRID_TOP = 152;
      /** Match top inset; used for grid area height + cover sizing math. */
      const GRID2_BOTTOM_PAD = 16;
      const GRID2_SIDE_PAD = 24;
      const gridMonthTitle = posterGrid2MonthLine(month);
      const grid2Subtitle = posterGrid2Subtitle();
      const firstDay = new Date(year, month, 1).getDay();
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      /** Taller rows when that calendar week has no books (grid flows : blanks + days). */
      const GRID2_EMPTY_WEEK_MIN_H = 40;
      /** Cap per-day cover slot so a sparse month (few “book weeks”) does not stretch covers vertically. */
      const GRID2_COVER_SLOT_MAX = 96;
      const totalCells = firstDay + daysInMonth;
      const gridRowCount = Math.max(1, Math.ceil(totalCells / 7));
      const totalGridCells = gridRowCount * 7;
      const gridRowHasBook = Array.from({ length: gridRowCount }, () => false);
      for (let i = 0; i < totalCells; i++) {
        const r = Math.floor(i / 7);
        if (i >= firstDay) {
          const d = i - firstDay + 1;
          if (d >= 1 && d <= daysInMonth && entries[d]) gridRowHasBook[r] = true;
        }
      }

      /** Poster height matches 600×(5/4); keep grid math in sync with `aspectRatio: '4/5'`. */
      const GRID2_POSTER_H = 750;
      const gridInnerH = GRID2_POSTER_H - GRID2_GRID_TOP - GRID2_BOTTOM_PAD;
      const grid2DateBlockH = 10;
      /** 5- or 6-row months where every row has ≥1 book: tighter gaps (covers still sized to fit below). */
      const grid2UseDenseCovers =
        (gridRowCount === 5 || gridRowCount === 6) && gridRowHasBook.every(Boolean);
      const colGap = grid2UseDenseCovers ? 8 : 10;
      const rowGap = grid2UseDenseCovers
        ? gridRowCount >= 6
          ? 6
          : 8
        : gridRowCount >= 6
          ? 8
          : gridRowCount >= 5
            ? 12
            : 16;
      const grid2DateImgGap = grid2UseDenseCovers ? 2 : gridRowCount >= 6 ? 3 : 4;
      /** Always cap cover height to row budget so 6-week months are not clipped by overflow:hidden. */
      const rowGapsTotal = Math.max(0, gridRowCount - 1) * rowGap;
      const contentW = Number(baseStyle.width) - GRID2_SIDE_PAD * 2;
      const cellW = (contentW - 6 * colGap) / 7;
      /** 2:3 at cell width — used only to pick contain vs cover. */
      const naturalCoverH = Math.floor((cellW * 3) / 2);
      const rowBase = grid2DateBlockH + grid2DateImgGap;
      /** Rows with no books stay short; vertical budget is shared only across book rows → larger covers when many empty weeks. */
      const bookRowCount = gridRowHasBook.reduce((n, has) => n + (has ? 1 : 0), 0);
      const nonBookRows = gridRowCount - bookRowCount;
      const emptyRowApproxH = GRID2_EMPTY_WEEK_MIN_H + grid2DateBlockH + grid2DateImgGap;
      let grid2CoverSlotH = 40;
      if (bookRowCount > 0) {
        const bookBlockBudget =
          gridInnerH - rowGapsTotal - nonBookRows * emptyRowApproxH;
        grid2CoverSlotH = Math.max(
          40,
          Math.min(GRID2_COVER_SLOT_MAX, Math.floor(bookBlockBudget / bookRowCount - rowBase)),
        );
      }
      let usedGridH =
        bookRowCount * (rowBase + grid2CoverSlotH) +
        nonBookRows * emptyRowApproxH +
        rowGapsTotal;
      while (
        usedGridH + bookRowCount <= gridInnerH &&
        bookRowCount > 0 &&
        grid2CoverSlotH < GRID2_COVER_SLOT_MAX
      ) {
        grid2CoverSlotH += 1;
        usedGridH =
          bookRowCount * (rowBase + grid2CoverSlotH) +
          nonBookRows * emptyRowApproxH +
          rowGapsTotal;
      }
      const grid2CoverObjectFit: 'contain' | 'cover' =
        grid2CoverSlotH <= naturalCoverH ? 'contain' : 'cover';

      return (
        <div
          ref={ref}
          style={{
            width: baseStyle.width,
            aspectRatio: baseStyle.aspectRatio,
            position: baseStyle.position,
            overflow: baseStyle.overflow,
            borderRadius: baseStyle.borderRadius,
            fontFamily: GRID2_FONT,
            backgroundColor: '#EDEDED',
            color: GRID2_TEXT,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: GRID2_HEADER_TOP,
              left: GRID2_SIDE_PAD,
              right: GRID2_SIDE_PAD,
              zIndex: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              minHeight: GRID2_GRID_TOP - GRID2_HEADER_TOP,
              boxSizing: 'border-box',
            }}
          >
            <p
              style={{
                margin: 0,
                width: '100%',
                fontFamily: 'Pretendard, system-ui, sans-serif',
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                color: GRID2_TEXT,
              }}
            >
              {gridMonthTitle}
              <br />
              {grid2Subtitle}
            </p>
            <span
              style={{
                fontFamily: 'Pretendard, system-ui, sans-serif',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: GRID2_TEXT,
                flexShrink: 0,
                paddingTop: 10,
              }}
            >
              {year}
            </span>
          </div>

          <div
            style={{
              position: 'absolute',
              top: GRID2_GRID_TOP,
              left: GRID2_SIDE_PAD,
              right: GRID2_SIDE_PAD,
              bottom: GRID2_BOTTOM_PAD,
              zIndex: 1,
              minHeight: 0,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                columnGap: colGap,
                rowGap,
                alignContent: 'start',
                width: '100%',
              }}
            >
              {Array.from({ length: totalGridCells }, (_, i) => {
                const row = Math.floor(i / 7);
                const stretchRow = !gridRowHasBook[row];
                let displayDay: number;
                let dateColor = GRID2_TEXT;
                let currMonthDay: number | null = null;
                if (i < firstDay) {
                  displayDay = prevMonthLastDay - firstDay + 1 + i;
                  dateColor = GRID2_OUT_MONTH_DATE;
                } else if (i < firstDay + daysInMonth) {
                  currMonthDay = i - firstDay + 1;
                  displayDay = currMonthDay;
                } else {
                  displayDay = i - firstDay - daysInMonth + 1;
                  dateColor = GRID2_OUT_MONTH_DATE;
                }
                const book = currMonthDay != null ? entries[currMonthDay] : undefined;
                return (
                  <div
                    key={`g2-cell-${i}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: grid2DateImgGap,
                      minWidth: 0,
                      minHeight: stretchRow ? GRID2_EMPTY_WEEK_MIN_H : 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Pretendard, system-ui, sans-serif',
                        fontSize: 10,
                        fontWeight: 700,
                        color: dateColor,
                        lineHeight: 1,
                      }}
                    >
                      {displayDay}
                    </span>
                    {book ? (
                      <div
                        style={{
                          width: '100%',
                          height: grid2CoverSlotH,
                          borderRadius: 0,
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#EDEDED',
                        }}
                      >
                        <BookImg
                          src={book.coverDataUrl ?? book.coverUrl}
                          alt={book.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: grid2CoverObjectFit,
                            display: 'block',
                          }}
                        />
                      </div>
                    ) : null}
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
      const monthName =
        posterLocale === 'ko'
          ? `${month + 1}월에는`
          : MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase();

      /** Safe zone: Tailwind p-6 (24px) — keeps type & covers off the poster edge */
      const STACK_SAFE_PAD = 24;

      // Layout positions — relative layout inside safe zone; whole group is shifted so its bbox is horizontally centered
      const posterH = 750;
      const innerH = posterH - 2 * STACK_SAFE_PAD;
      const INNER_W = 600 - 2 * STACK_SAFE_PAD;
      /** 4-column dense grid: horizontal gap between cover cells (px). */
      const STACK_DENSE_COL_GAP_PX = 16;
      const TITLE_TOP_PX = 36;
      const TITLE_FONT_SIZE = 80;
      /** Month line only: slightly smaller in KO so Hangul + “월에는” fits the band */
      const STACK_MONTH_TITLE_FONT_SIZE = posterLocale === 'ko' ? 72 : TITLE_FONT_SIZE;
      const TITLE_SUBLINE_FONT_SIZE = TITLE_FONT_SIZE / 2;
      const TITLE_FONT_FAMILY = "'Instrument Sans', sans-serif";
      const STACK_TITLE_COLOR = '#000000';
      const TITLE_GAP_PX = 60;
      /** Second-line marginTop vs first line; EN keeps legacy tight -2. KO adds 2× nominal gap for breathing room */
      const STACK_SUBLINE_MARGIN_TOP_EN = -2;
      const STACK_KO_TITLE_INTERLINE_BASE_PX = 8;
      const STACK_SUBLINE_MARGIN_TOP =
        posterLocale === 'ko'
          ? STACK_SUBLINE_MARGIN_TOP_EN + 2 * STACK_KO_TITLE_INTERLINE_BASE_PX
          : STACK_SUBLINE_MARGIN_TOP_EN;
      /** Nudge cover stack slightly above true vertical center of the band below the title */
      const STACK_COLLAGE_NUDGE_UP_PX = 20;
      /** Titles can extend past covers; shift whole collage slightly left so the block feels centered. */
      const STACK_COLLAGE_X_BIAS_PX = -14;

      /** Uniform title column width per layout so long titles don’t shift cover centers. */
      const getStackTitleSlotPx = (count: number): number => {
        if (count <= 0) return Math.floor(INNER_W * 0.5);
        if (count === 1) return Math.min(340, Math.floor(INNER_W * 0.65));
        if (count === 2) return Math.floor(INNER_W * 0.42);
        if (count === 3) return Math.floor(INNER_W * 0.29);
        if (count === 4) return Math.floor(INNER_W * 0.36);
        if (count === 5) return Math.floor(INNER_W * 0.28);
        if (count === 6) return Math.floor(INNER_W * 0.27);
        const cols = 4;
        const sidePct = 4;
        const cellWPct = (100 - 2 * sidePct) / cols;
        return Math.max(72, Math.floor((INNER_W * cellWPct) / 100));
      };

      /** Neat grid: no rotation, aligned rows/columns inside the safe zone */
      const getPositions = (count: number) => {
        const R = 0;
        if (count === 1) {
          return [{ left: '50%', top: '32%', rotate: R, w: 200, h: 286, centerX: true as const }];
        }
        if (count === 2) {
          return [
            { left: '11%', top: '30%', rotate: R, w: 162, h: 232 },
            { left: '57%', top: '30%', rotate: R, w: 162, h: 232 },
          ];
        }
        if (count === 3) {
          return [
            { left: '7%', top: '30%', rotate: R, w: 142, h: 203 },
            { left: '36%', top: '30%', rotate: R, w: 142, h: 203 },
            { left: '65%', top: '30%', rotate: R, w: 142, h: 203 },
          ];
        }
        if (count === 4) {
          return [
            { left: '17%', top: '26%', rotate: R, w: 124, h: 177 },
            { left: '54%', top: '26%', rotate: R, w: 124, h: 177 },
            { left: '17%', top: '56%', rotate: R, w: 124, h: 177 },
            { left: '54%', top: '56%', rotate: R, w: 124, h: 177 },
          ];
        }
        if (count === 5) {
          return [
            { left: '6%', top: '25%', rotate: R, w: 114, h: 163 },
            { left: '34%', top: '25%', rotate: R, w: 114, h: 163 },
            { left: '62%', top: '25%', rotate: R, w: 114, h: 163 },
            { left: '24%', top: '55%', rotate: R, w: 114, h: 163 },
            { left: '52%', top: '55%', rotate: R, w: 114, h: 163 },
          ];
        }
        if (count === 6) {
          return [
            { left: '8%', top: '25%', rotate: R, w: 104, h: 149 },
            { left: '34%', top: '25%', rotate: R, w: 104, h: 149 },
            { left: '60%', top: '25%', rotate: R, w: 104, h: 149 },
            { left: '8%', top: '54%', rotate: R, w: 104, h: 149 },
            { left: '34%', top: '54%', rotate: R, w: 104, h: 149 },
            { left: '60%', top: '54%', rotate: R, w: 104, h: 149 },
          ];
        }

        const cols = 4;
        const rows = Math.ceil(count / cols);
        const gapPx = STACK_DENSE_COL_GAP_PX;
        /** Many-book grid: cover size vs original caps (1.3× then +1.3× from that baseline ≈ 1.69×). */
        const STACK_MANY_BOOK_COVER_SCALE = 1.3 * 1.3;
        /** Reserve vertical space under each cover for title lines (px in poster inner coords) */
        const stackTitleBelowCoverPx = count > 12 ? 40 : count > 8 ? 44 : 50;
        const bandTop = 22;
        /** Slightly lower bottom = taller band → a bit more vertical space between rows. */
        const bandBottom = 79;
        const bandPx = ((bandBottom - bandTop) / 100) * innerH;
        const rowHpx = rows > 0 ? bandPx / rows : bandPx;
        const coverWMax = Math.round(96 * STACK_MANY_BOOK_COVER_SCALE);
        const coverWMin = Math.round(52 * STACK_MANY_BOOK_COVER_SCALE);
        let coverW = Math.max(
          coverWMin,
          Math.min(coverWMax, Math.floor((INNER_W * 0.9 - gapPx * (cols - 1)) / cols)),
        );
        let coverH = Math.round(coverW * 1.43);
        if (coverH + stackTitleBelowCoverPx > rowHpx) {
          coverH = Math.max(48, Math.floor(rowHpx - stackTitleBelowCoverPx));
          coverW = Math.max(48, Math.floor(coverH / 1.43));
        }
        const cwPct = (coverW / INNER_W) * 100;
        const blockH = coverH + stackTitleBelowCoverPx;
        const blockPct = (blockH / innerH) * 100;
        const sidePct = 4;
        const cellWPct = (100 - 2 * sidePct) / cols;
        const bandH = bandBottom - bandTop;
        const cellHPct = rows > 0 ? bandH / rows : bandH;
        const out: Array<{ left: string; top: string; rotate: number; w: number; h: number }> = [];
        for (let i = 0; i < count; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const leftPct = sidePct + col * cellWPct + (cellWPct - cwPct) / 2;
          const topPct = bandTop + row * cellHPct + (cellHPct - blockPct) / 2;
          out.push({
            left: `${Math.max(0, Math.min(100 - cwPct, leftPct))}%`,
            top: `${Math.max(bandTop, Math.min(bandBottom - blockPct, topPct))}%`,
            rotate: R,
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
      const stackTitleSlotPx = getStackTitleSlotPx(books.length);
      const titleBottomPx =
        TITLE_TOP_PX +
        STACK_MONTH_TITLE_FONT_SIZE * 1.05 +
        STACK_SUBLINE_MARGIN_TOP +
        TITLE_SUBLINE_FONT_SIZE * 1.05;

      /** Vertical band for covers (below title); center cover stack in this band */
      const collageBandTop = titleBottomPx + TITLE_GAP_PX;
      const collageBandBottom = innerH - STACK_SAFE_PAD;
      const collageBandH = Math.max(0, collageBandBottom - collageBandTop);
      let yShiftPx = 0;
      if (positions.length > 0) {
        const minBaseTop = Math.min(
          ...positions.map((p) => (Number.parseFloat(p.top) / 100) * innerH),
        );
        const maxBaseBottom = Math.max(
          ...positions.map((p) => (Number.parseFloat(p.top) / 100) * innerH + p.h),
        );
        const coverStackH = Math.max(1, maxBaseBottom - minBaseTop);
        const yIdeal =
          collageBandTop +
          (collageBandH - coverStackH) / 2 -
          STACK_COLLAGE_NUDGE_UP_PX -
          minBaseTop;
        const yMin = collageBandTop - minBaseTop;
        const yMax = collageBandBottom - maxBaseBottom;
        yShiftPx = yIdeal;
        yShiftPx = Math.max(yShiftPx, yMin);
        if (yMax >= yMin) yShiftPx = Math.min(yShiftPx, yMax);
      }

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
        return INNER_W / 2 - (minL + maxR) / 2 + STACK_COLLAGE_X_BIAS_PX;
      })();

      const stackBg = '#ffffff';
      const stackFrameBorder = '1px solid rgba(0, 0, 0, 0.08)';
      const stackReadLine =
        posterLocale === 'ko'
          ? `${books.length}권의 책을 읽었어요`
          : `with ${books.length} ${books.length === 1 ? 'book' : 'books'}`;

      return (
        <div
          ref={ref}
          style={{
            ...baseStyle,
            backgroundColor: stackBg,
            border: stackFrameBorder,
            boxSizing: 'border-box',
          }}
        >
          {/* Paper texture overlay — full bleed */}
          <img src={paperTexture} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, mixBlendMode: 'multiply' }} />

          {/* Safe zone: type & covers */}
          <div className="absolute inset-6 z-[5] overflow-visible">
            {/* Title section */}
            <div style={{ position: 'absolute', top: TITLE_TOP_PX, left: 0, right: 0, zIndex: 30 }}>
              <p style={{ fontFamily: TITLE_FONT_FAMILY, fontSize: STACK_MONTH_TITLE_FONT_SIZE, fontWeight: 700, color: STACK_TITLE_COLOR, lineHeight: 1.05, letterSpacing: '-0.02em', textAlign: 'left' }}>
                {monthName}
              </p>
              <p style={{ fontFamily: TITLE_FONT_FAMILY, fontSize: TITLE_SUBLINE_FONT_SIZE, fontWeight: 700, color: STACK_TITLE_COLOR, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: STACK_SUBLINE_MARGIN_TOP, textAlign: 'left' }}>
                {stackReadLine}
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
                    <div
                      key={book.key}
                      style={{
                        position: 'absolute',
                        left: anchorCenter ? '50%' : pos.left,
                        top: `calc(${pos.top} + ${yShiftPx}px)`,
                        transform: anchorCenter ? `translateX(-50%) rotate(${pos.rotate}deg)` : `rotate(${pos.rotate}deg)`,
                        zIndex: 10 + i * 2,
                        width: pos.w,
                        boxSizing: 'border-box',
                        paddingTop: 4,
                      }}
                    >
                      <div style={{ borderRadius: 3, overflow: 'hidden', width: pos.w, filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.18))' }}>
                        <BookImg src={book.coverDataUrl ?? book.coverUrl} alt={book.title} style={{ width: pos.w, height: pos.h, display: 'block' }} />
                      </div>
                      <p
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: pos.h + 12,
                          transform: 'translateX(-50%)',
                          width: stackTitleSlotPx,
                          maxWidth: stackTitleSlotPx,
                          margin: 0,
                          boxSizing: 'border-box',
                          fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
                          fontSize: titleFontSize,
                          color: '#2C2C2C',
                          opacity: 0.65,
                          textAlign: 'center',
                          letterSpacing: '-0.02em',
                          lineHeight: 1.35,
                          whiteSpace: 'normal',
                          overflow: 'visible',
                          wordBreak: 'break-word',
                          zIndex: 10 + i * 2 + 1,
                          padding: '1px 4px',
                          borderRadius: 2,
                        }}
                      >
                        {book.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    // ─── LIST ───
    if (template === 'list') {
      const listFont = "'Pretendard', system-ui, sans-serif";
      const listMonthTitle = posterListHeaderMonthYear(posterLocale, month, year);
      const listBg = '#ffffff';
      const listFrameBorder = '1px solid rgba(0, 0, 0, 0.08)';
      const listInk = '#1a1a1a';
      const listPad = 24;
      const listCoverStrokeGap = 8;
      const listRowGapDateToCover = 32;
      /** Poster inner height matches 600×4/5 canvas */
      const LIST_POSTER_H = 750;
      const listTitleTopMin = 40;
      const listMonthBlockH = 48;
      const listBelowTitleGap = 14;
      /** List row title / author; shrink when many books so rows fit the poster */
      let listBookTitleDefaultPx = 20;
      let listTitleLineH = 1.3;
      let listAuthorFontPx = 16;
      const listAuthorGap = 2;
      const listRows = readsSortedByDay;
      const listRowCount = listRows.length;
      if (listRowCount >= 10) {
        listBookTitleDefaultPx = 17;
        listAuthorFontPx = 13;
        listTitleLineH = 1.25;
      }
      /** Tighter row padding when many items */
      const listDenseRows = listRowCount >= 5;
      const listVeryDenseRows = listRowCount >= 8;
      const listExtraDenseRows = listRowCount >= 12;
      let listRowPadYBottom =
        listExtraDenseRows ? 4 : listVeryDenseRows ? 5 : listDenseRows ? 7 : 12;

      const listInnerMain =
        LIST_POSTER_H - Math.max(listTitleTopMin, listPad) - listPad;
      const listMaxListBlockH =
        listInnerMain - listMonthBlockH - listBelowTitleGap;
      const listBorderTopH = 1;

      /** Padding above day number + title block in each list row (may tighten to fit all rows). */
      let listRowPadYTop = listExtraDenseRows ? 6 : listVeryDenseRows ? 8 : 12;
      let listDateFontPx = listExtraDenseRows ? 22 : listVeryDenseRows ? 24 : 28;
      const listDateColW = 48;
      /** Row cap: min(120, poster budget/n); then reduced in loop if content still overflows. */
      let listRowMaxH = 120;
      /** Cover image height = list row height minus this (px) */
      let listCoverShyOfRowPx = 16;

      /** Row height from date/title; cover is row − listCoverShyOfRowPx (see JSX). */
      const listMeasureListTotalH = (
        withAuthor: boolean,
        rowMaxH: number,
        padTop: number,
        padBottom: number,
        datePx: number,
      ) => {
        if (listRowCount === 0) return listBorderTopH;
        const titleBlock =
          listBookTitleDefaultPx * listTitleLineH +
          (withAuthor ? listAuthorGap + listAuthorFontPx : 0);
        const contentH = Math.max(datePx, Math.ceil(titleBlock));
        const rowH = Math.min(padTop + padBottom + contentH + 1, rowMaxH);
        return listBorderTopH + listRowCount * rowH;
      };

      let listShowAuthor = true;
      const listFits = (author: boolean, rowMax: number) =>
        listMeasureListTotalH(
          author,
          rowMax,
          listRowPadYTop,
          listRowPadYBottom,
          listDateFontPx,
        ) <= listMaxListBlockH;

      if (listRowCount > 0) {
        const listListBodyBudget = listMaxListBlockH - listBorderTopH;
        /** Per-row cap so n rows (+ list top border) stay within poster; allow <12px when n is large */
        listRowMaxH = Math.min(
          120,
          Math.max(3, Math.floor(listListBodyBudget / listRowCount)),
        );
        const listMinRowH = 3;
        for (let step = 0; step < 200; step++) {
          if (listFits(listShowAuthor, listRowMaxH)) break;
          if (listShowAuthor) {
            listShowAuthor = false;
            continue;
          }
          if (listRowPadYTop > 4) {
            listRowPadYTop -= 2;
            continue;
          }
          if (listRowPadYBottom > 2) {
            listRowPadYBottom -= 1;
            continue;
          }
          if (listDateFontPx > 11) {
            listDateFontPx -= 1;
            continue;
          }
          if (listCoverShyOfRowPx > 2) {
            listCoverShyOfRowPx -= 2;
            continue;
          }
          if (listRowMaxH > listMinRowH) {
            listRowMaxH -= 1;
            continue;
          }
          break;
        }
      }

      const listCoverH = Math.max(0, listRowMaxH - listCoverShyOfRowPx);
      const listCoverW = Math.floor(listCoverH * 5 / 7);

      return (
        <div
          ref={ref}
          style={{
            ...baseStyle,
            backgroundColor: listBg,
            border: listFrameBorder,
            boxSizing: 'border-box',
            color: listInk,
            fontFamily: listFont,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'stretch',
              paddingTop: Math.max(listTitleTopMin, listPad),
              paddingBottom: listPad,
              paddingLeft: listPad,
              paddingRight: listPad,
              boxSizing: 'border-box',
              minHeight: 0,
              height: '100%',
            }}
          >
            <div style={{ textAlign: 'right', width: '100%', flexShrink: 0 }}>
              <p
                style={{
                  fontSize: 48,
                  fontWeight: 500,
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                  color: listInk,
                }}
              >
                {listMonthTitle}
              </p>
            </div>
            <div
              style={{
                flexShrink: 0,
                marginTop: listBelowTitleGap,
                marginLeft: -listPad,
                marginRight: -listPad,
                width: `calc(100% + ${listPad * 2}px)`,
                display: 'flex',
                flexDirection: 'column',
                borderTop: '1px solid #000',
              }}
            >
              {readsSortedByDay.length === 0 ? (
                <div
                  style={{
                    color: listInk,
                    padding: `${listRowPadYTop}px ${listPad}px ${listRowPadYBottom}px`,
                    borderBottom: '1px solid #000',
                  }}
                >
                  {emptyState}
                </div>
              ) : (
                listRows.map(({ day, book }) => (
                  <div
                    key={`${day}-${book.key}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'stretch',
                      paddingLeft: listPad,
                      paddingRight: listPad,
                      borderBottom: '1px solid #000',
                      boxSizing: 'border-box',
                      maxHeight: listRowMaxH,
                      overflow: 'hidden',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: listDateColW,
                        paddingTop: listRowPadYTop,
                        paddingBottom: listRowPadYBottom,
                        boxSizing: 'border-box',
                        marginRight: listRowGapDateToCover,
                      }}
                    >
                      <span
                        style={{
                          fontSize: listDateFontPx,
                          fontWeight: 500,
                          lineHeight: 1,
                          color: listInk,
                          textAlign: 'left',
                          display: 'block',
                        }}
                      >
                        {String(day).padStart(2, '0')}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: '0 0 auto',
                        height: '100%',
                        minHeight: 0,
                        minWidth: 0,
                        gap: listCoverStrokeGap,
                      }}
                    >
                      <div
                        style={{
                          width: listCoverW,
                          height: listCoverH,
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <BookImg
                          src={book.coverDataUrl ?? book.coverUrl}
                          alt={book.title}
                          style={{ width: listCoverW, height: listCoverH, display: 'block' }}
                        />
                      </div>
                      <div
                        aria-hidden
                        style={{
                          width: 0,
                          flexShrink: 0,
                          borderLeft: '1px solid #000',
                          alignSelf: 'stretch',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        flex: '1 1 0%',
                        minWidth: 0,
                        color: listInk,
                        paddingLeft: 16,
                        paddingTop: listRowPadYTop,
                        paddingBottom: listRowPadYBottom,
                        boxSizing: 'border-box',
                      }}
                    >
                      <p
                        style={{
                          fontSize: listBookTitleDefaultPx,
                          fontWeight: 500,
                          letterSpacing: '-0.02em',
                          lineHeight: listTitleLineH,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {book.title}
                      </p>
                      {listShowAuthor ? (
                        <p style={{ fontSize: listAuthorFontPx, opacity: 0.4, marginTop: listAuthorGap, marginBottom: 0 }}>
                          {book.author}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    // ─── ESSAY: prose block — “In {month}, I read …” + titled list + closing line ───
    if (template === 'essay') {
      const essayFont = "'Pretendard', 'Noto Sans KR', sans-serif";
      const monthName = MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase();
      const essayRows = readsSortedByDayUnique;
      const essayN = essayRows.length;
      const darkPoster = mood === 'dark' || mood === 'bold';
      const essayGridCell = 56;
      const essayGridStroke = darkPoster ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)';
      const essayIntroHeadingPx = 64;
      const essayHeadlineBase: React.CSSProperties = {
        margin: 0,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: moodConfig.textColor,
      };
      const essayHeadlineIntro: React.CSSProperties = {
        ...essayHeadlineBase,
        fontSize: essayIntroHeadingPx,
        lineHeight: 1.1,
        transform: 'translate(-2px, -2px)',
      };
      const essayHeadlineOutro: React.CSSProperties = {
        ...essayHeadlineBase,
        fontSize: 48,
        lineHeight: 1.2,
        height: 157,
      };
      let essayTitlePx = 28;
      let essayTitleGap = 20;
      let essaySectionGap = 28;
      if (essayN > 12) {
        essayTitlePx = 18;
        essayTitleGap = 9;
        essaySectionGap = 18;
      } else if (essayN > 8) {
        essayTitlePx = 20;
        essayTitleGap = 11;
        essaySectionGap = 20;
      } else if (essayN > 5) {
        essayTitlePx = 23;
        essayTitleGap = 16;
        essaySectionGap = 24;
      }

      /** Poster inner height (600×4/5) minus vertical padding. */
      const ESSAY_POSTER_W = 600;
      const ESSAY_POSTER_H = 750;
      const essayGridCols = Math.max(1, Math.floor((ESSAY_POSTER_W - 64) / essayGridCell));
      const essayGridRows = Math.max(1, Math.floor((ESSAY_POSTER_H - 64) / essayGridCell));
      const essayGridW = essayGridCols * essayGridCell;
      const essayGridH = essayGridRows * essayGridCell;
      const essayGridStartX = (ESSAY_POSTER_W - essayGridW) / 2;
      const essayGridStartY = (ESSAY_POSTER_H - essayGridH) / 2;
      const essayVertPad = 96;
      const essayContentW = essayGridW;
      const essayTitleStartRow = 4;
      const essayTitleStartOffset = (essayTitleStartRow - 1) * essayGridCell;
      const essayLineHeight = 1.38;
      const essayThumbTextGap = 10;
      /** Cover thumbnail height = title font size × this (width stays 5∶7 of height). */
      const essayCoverHeightToFont = 1.25;
      /** Reserve space for two-line outro at 48px / 1.2. */
      const essayOutroReserve = Math.ceil(48 * 1.2 * 2.5);

      const estimateEssayListHeight = (titlePx: number, gap: number): number => {
        if (essayN === 0) return 0;
        const thumbH = titlePx * essayCoverHeightToFont;
        const thumbW = Math.round((thumbH * 5) / 7);
        const textMaxW = Math.max(100, essayContentW - essayThumbTextGap - thumbW);
        const charPx = titlePx * 0.56;
        let total = 0;
        for (let ri = 0; ri < essayRows.length; ri++) {
          const units = Math.max(1, [...essayRows[ri].book.title].length);
          const lines = Math.max(1, Math.ceil((units * charPx) / textMaxW));
          const textBlockH = lines * titlePx * essayLineHeight;
          total += Math.max(textBlockH, thumbH);
          if (ri < essayRows.length - 1) total += gap;
        }
        return total;
      };

      const essayMiddleBudget = (sectionGap: number) =>
        ESSAY_POSTER_H -
        essayVertPad -
        (essayIntroHeadingPx * 1.1 * 2 + sectionGap) -
        essayOutroReserve;

      if (essayN >= 9) {
        for (let step = 0; step < 240; step++) {
          const budget = essayMiddleBudget(essaySectionGap);
          const listH = estimateEssayListHeight(essayTitlePx, essayTitleGap);
          if (listH <= budget) break;
          if (essayTitleGap > 4) {
            essayTitleGap -= 1;
            continue;
          }
          if (essaySectionGap > 12) {
            essaySectionGap -= 1;
            continue;
          }
          if (essayTitlePx > 12) {
            essayTitlePx -= 1;
            continue;
          }
          break;
        }
      }

      const essayCoverThumbH = essayTitlePx * essayCoverHeightToFont;
      const essayCoverThumbW = Math.round((essayCoverThumbH * 5) / 7);

      return (
        <div
          ref={ref}
          style={{
            ...baseStyle,
            fontFamily: essayFont,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: `${essayGridStartY}px ${essayGridStartX}px`,
            minHeight: 0,
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: essayGridW,
              height: essayGridH,
              transform: 'translate(-50%, -50%)',
              boxSizing: 'border-box',
              backgroundImage: `
                linear-gradient(to right, ${essayGridStroke} 1px, transparent 1px),
                linear-gradient(to bottom, ${essayGridStroke} 1px, transparent 1px),
                linear-gradient(to left, ${essayGridStroke} 1px, transparent 1px),
                linear-gradient(to top, ${essayGridStroke} 1px, transparent 1px)
              `,
              backgroundSize: `${essayGridCell}px ${essayGridCell}px`,
              backgroundPosition: '0 0',
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              flexShrink: 0,
              width: '100%',
              boxSizing: 'border-box',
              height: essayTitleStartOffset,
              overflow: 'hidden',
            }}
          >
            <div style={{ transform: 'translate(-2px, -2px)' }}>
              <div style={{ ...essayHeadlineBase, fontSize: essayIntroHeadingPx, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                In {monthName},
              </div>
              <div style={{ ...essayHeadlineBase, fontSize: essayIntroHeadingPx, lineHeight: 1.1, marginTop: -14, whiteSpace: 'nowrap' }}>
                I read:
              </div>
            </div>
          </div>
          <div
            style={{
              flex: '1 1 0%',
              minHeight: 0,
              minWidth: 0,
              width: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            {essayN === 0 ? (
              emptyState
            ) : (
              essayRows.map(({ book }, i) => (
                <div
                  key={`${book.key}-${i}`}
                  style={{
                    width: essayContentW,
                    boxSizing: 'border-box',
                    color: moodConfig.textColor,
                    height: essayGridCell,
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      flex: '0 1 auto',
                      minWidth: 0,
                      maxWidth: essayContentW - essayCoverThumbW - 10,
                      fontSize: essayTitlePx,
                      lineHeight: 1,
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                    }}
                  >
                    {book.title}
                  </span>
                  <BookImg
                    src={book.coverDataUrl ?? book.coverUrl}
                    alt=""
                    style={{
                      flexShrink: 0,
                      height: essayCoverThumbH,
                      width: essayCoverThumbW,
                      borderRadius: 2,
                      marginLeft: 10,
                    }}
                  />
                </div>
              ))
            )}
          </div>
          <div style={{ flexShrink: 0, width: '100%', boxSizing: 'border-box', height: 157, overflow: 'hidden' }}>
            <div style={{ ...essayHeadlineBase, fontSize: 48, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              and these pages have
            </div>
            <div style={{ ...essayHeadlineBase, fontSize: 48, lineHeight: 1.2, display: 'flex', alignItems: 'baseline', flexWrap: 'nowrap' }}>
              <span style={{ display: 'inline-block', transform: 'skewX(-10deg)', transformOrigin: '50% 55%', flexShrink: 0, whiteSpace: 'nowrap' }}>
                reshaped
              </span>
              <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>&nbsp;my thoughts.</span>
            </div>
          </div>
        </div>
      );
    }

    // ─── TIMELINE: full month 1…last day; spine; read days left (+ title), unread right ───
    if (template === 'timeline') {
      const timelineVerticalLabel = posterTimelineVerticalLabel(posterLocale, month, year);
      const timelineInk = '#121212';
      const lineHeavy = 2;
      const posterHeight = 750;
      const scatterFont = "'Pretendard', 'Noto Sans KR', sans-serif";
      const timelinePosterW = Number(baseStyle.width) || 600;
      /** Vertical spine: inset from the poster’s right edge (~40px + 24px further left). */
      const lineX = Math.round(timelinePosterW - 64);
      const monthRailW = 56;
      const readDatePx = 48;
      const readTitlePx = 32;

      const bookByDay = entries as Record<number, Book | undefined>;
      const nDays = daysInMonth;
      /**
       * Timeline layout order:
       * 1) Day 1 / last day centers pinned near poster top & bottom.
       * 2) Read rows use fixed height; consecutive read days — minimum center gap only (no extra pad).
       * 3) Unread font size maximized (binary search); slack only on 1↔2 and (n-1)↔n gaps.
       */
      /** One-line read row (~max of date & title); used for vertical packing. */
      const readRowVisualH = Math.ceil(Math.max(readDatePx * 1.02, readTitlePx * 1.05) + 4);
      /** Pull consecutive read-day centers closer than nominal half-heights (removes “air” between rows). */
      const PAD_READ_READ = -14;
      const PAD_READ_UNREAD = 0;
      const PAD_UNREAD_UNREAD = 0;
      /** Small screen padding so glyphs aren’t clipped at top/bottom. */
      const TIMELINE_V_PAD = 4;

      const rowBlockH = (dayIndex: number, unreadPx: number) =>
        bookByDay[dayIndex + 1] ? readRowVisualH : unreadPx;

      /** Min center-distance between calendar day (i+1) and (i+2). */
      const minGapBetween = (i: number, unreadPx: number) => {
        const readA = Boolean(bookByDay[i + 1]);
        const readB = Boolean(bookByDay[i + 2]);
        const ha = readA ? readRowVisualH : unreadPx;
        const hb = readB ? readRowVisualH : unreadPx;
        const base = (ha + hb) / 2;
        if (readA && readB) return Math.max(readDatePx * 0.72, base + PAD_READ_READ);
        if (!readA && !readB) return base + PAD_UNREAD_UNREAD;
        return base + PAD_READ_UNREAD;
      };

      const computeRowCenters = (unreadPx: number): number[] | null => {
        if (nDays <= 1) return [posterHeight / 2];
        let sumMinGaps = 0;
        for (let i = 0; i < nDays - 1; i++) sumMinGaps += minGapBetween(i, unreadPx);
        const c0 = TIMELINE_V_PAD + rowBlockH(0, unreadPx) / 2;
        const cLast = posterHeight - TIMELINE_V_PAD - rowBlockH(nDays - 1, unreadPx) / 2;
        if (cLast - c0 < sumMinGaps) return null;
        const gaps: number[] = [];
        for (let i = 0; i < nDays - 1; i++) gaps.push(minGapBetween(i, unreadPx));
        const slack = cLast - c0 - sumMinGaps;
        if (slack > 0) {
          if (nDays === 2) {
            gaps[0] = (gaps[0] ?? 0) + slack;
          } else {
            const halfSlack = slack / 2;
            gaps[0] = (gaps[0] ?? 0) + halfSlack;
            gaps[nDays - 2] = (gaps[nDays - 2] ?? 0) + (slack - halfSlack);
          }
        }
        const out: number[] = [];
        let y = c0;
        for (let i = 0; i < nDays; i++) {
          out.push(y);
          if (i < nDays - 1) y += gaps[i]!;
        }
        return out;
      };

      let unreadDatePx = 10;
      let rowCenterY: number[] = [];
      if (nDays <= 1) {
        rowCenterY = [posterHeight / 2];
        const innerH = posterHeight - 2 * TIMELINE_V_PAD;
        unreadDatePx = Math.min(120, Math.max(12, Math.floor(innerH * 0.42)));
      } else {
        const base = computeRowCenters(10);
        if (!base) {
          unreadDatePx = 10;
          rowCenterY = Array.from({ length: nDays }, (_, i) => {
            const h0 = rowBlockH(0, 10) / 2 + TIMELINE_V_PAD;
            const h1 = rowBlockH(nDays - 1, 10) / 2 + TIMELINE_V_PAD;
            return h0 + (i / (nDays - 1)) * (posterHeight - h0 - h1);
          });
        } else {
          let lo = 10;
          let hi = 120;
          let bestU = 10;
          let bestCenters = base;
          while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const c = computeRowCenters(mid);
            if (c) {
              bestU = mid;
              bestCenters = c;
              lo = mid + 1;
            } else {
              hi = mid - 1;
            }
          }
          unreadDatePx = bestU;
          rowCenterY = bestCenters;
        }
      }

      return (
        <div
          ref={ref}
          style={{
            ...baseStyle,
            color: timelineInk,
            textAlign: 'left',
            isolation: 'isolate',
            overflow: 'visible',
          }}
        >
          <svg
            width={timelinePosterW}
            height={posterHeight}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              pointerEvents: 'none',
              overflow: 'visible',
              zIndex: 1,
            }}
            aria-hidden
          >
            <line
              x1={lineX}
              y1={0}
              x2={lineX}
              y2={posterHeight}
              stroke={timelineInk}
              strokeWidth={lineHeavy}
              strokeLinecap="butt"
            />
          </svg>

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const book = bookByDay[day];
            const y = rowCenterY[i] ?? posterHeight / 2;
            const dateGap = 8;
            const leftBlockW = lineX - monthRailW - 10 - dateGap;

            if (book) {
              return (
                <div
                  key={`tl-${day}`}
                  style={{
                    position: 'absolute',
                    left: monthRailW + 6,
                    top: y,
                    width: Math.max(80, leftBlockW),
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 12,
                    boxSizing: 'border-box',
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingRight: dateGap,
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: scatterFont,
                      fontSize: readTitlePx,
                      fontWeight: 600,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      color: timelineInk,
                      textAlign: 'right',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                      flex: '1 1 auto',
                    }}
                    title={book.title}
                  >
                    {book.title}
                  </span>
                  <span
                    style={{
                      fontFamily: scatterFont,
                      fontSize: readDatePx,
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: timelineInk,
                      flexShrink: 0,
                      lineHeight: 1,
                      display: 'block',
                    }}
                  >
                    {day}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={`tl-${day}`}
                style={{
                  position: 'absolute',
                  left: lineX + dateGap,
                  top: y,
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  margin: 0,
                  padding: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: scatterFont,
                    fontSize: unreadDatePx,
                    fontWeight: 700,
                    letterSpacing: 0,
                    color: timelineInk,
                    lineHeight: 1,
                    margin: 0,
                    padding: 0,
                    display: 'block',
                  }}
                >
                  {day}
                </span>
              </div>
            );
          })}

          {/* Template-only decor: top-right of horizontal string = (12,12) so “2026” ends at that corner after -90°. */}
          <div
            style={{
              position: 'absolute',
              left: 12,
              top: 12,
              width: 0,
              height: 0,
              overflow: 'visible',
              pointerEvents: 'none',
              zIndex: 0,
            }}
            aria-hidden
          >
            <span
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                display: 'inline-block',
                transform: 'rotate(-90deg)',
                transformOrigin: 'right top',
                fontFamily: scatterFont,
                fontSize: Math.min(112, Math.max(72, posterHeight * 0.136)),
                fontWeight: 700,
                letterSpacing: '-0.04em',
                whiteSpace: 'nowrap',
                color: '#ebebeb',
                lineHeight: 1,
              }}
            >
              {timelineVerticalLabel}
            </span>
          </div>
        </div>
      );
    }

    // ─── CAPSULE LIST: half-pill border, # | title (wrap) ───
    if (template === 'capsule') {
      const capsuleFont = "'Instrument Sans', 'Noto Sans KR', sans-serif";
      const capsuleHeadNumFont = "'Pretendard', 'Noto Sans KR', sans-serif";
      const n = readsSortedByDayUnique.length;
      /** Poster inner height matches 600×4/5 canvas */
      const CAPSULE_POSTER_H = 750;
      const padY = n >= 8 ? 24 : n >= 7 ? 26 : 30;
      const capsuleHeaderMarginBottom = n >= 8 ? 26 : n >= 7 ? 30 : 42;
      const capsuleHeaderFontPx = n >= 8 ? 44 : 48;
      const capsuleHeaderLinePx = n >= 8 ? 50 : 56;
      const capsuleHeaderTextH = capsuleHeaderLinePx * 2;
      let gap = n <= 5 ? 12 : n <= 9 ? 9 : n <= 14 ? 7 : 6;
      let capsuleMinH = 60;
      let capsuleDefaultH = 100;
      let capsuleNumColW = 64;
      let titleFontPx = 28;
      let numFs = 38;
      let capsuleTitleCellPadding = '12px 16px 12px 12px';
      let capsuleNumCellPadding = '8px 4px';

      if (n === 7 || n === 8) {
        gap = n === 8 ? 5 : 6;
        const listBudget = CAPSULE_POSTER_H - 2 * padY - capsuleHeaderTextH - capsuleHeaderMarginBottom;
        const spare = 6;
        capsuleDefaultH = Math.max(
          54,
          Math.min(80, Math.floor((listBudget - (n - 1) * gap - spare) / n)),
        );
        capsuleMinH = Math.min(56, capsuleDefaultH - 4);
        capsuleNumColW = n === 8 ? 58 : 60;
        titleFontPx = n === 8 ? 22 : 24;
        numFs = n === 8 ? 30 : 34;
        capsuleTitleCellPadding = n === 8 ? '6px 12px 6px 10px' : '8px 14px 8px 10px';
        capsuleNumCellPadding = n === 8 ? '6px 3px' : '7px 4px';
      }

      const capsuleFrameBorder = '1px solid rgba(0, 0, 0, 0.08)';

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
            backgroundColor: '#FFFFFF',
            border: capsuleFrameBorder,
          }}
        >
          <p
            style={{
              flexShrink: 0,
              margin: 0,
              marginBottom: capsuleHeaderMarginBottom,
              fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: capsuleHeaderFontPx,
              fontWeight: 800,
              letterSpacing: '-2px',
              color: moodConfig.textColor,
              textAlign: 'left',
              lineHeight: `${capsuleHeaderLinePx}px`,
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
              {readsSortedByDayUnique.map(({ day, book }, i) => (
                <div
                  key={`${day}-${book.key}`}
                  style={{
                    boxSizing: 'border-box',
                    minHeight: capsuleMinH,
                    height: capsuleDefaultH,
                    borderTop: '4px solid #000',
                    borderBottom: '4px solid #000',
                    borderLeft: '4px solid #000',
                    borderRight: 'none',
                    borderRadius: '9999px 0 0 9999px',
                    backgroundColor: '#FFFFFF',
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
                      padding: capsuleNumCellPadding,
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
                      borderLeft: '4px solid #000',
                      alignSelf: 'stretch',
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: capsuleTitleCellPadding,
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

    // ─── MOSAIC: colored cells, covers only; grid shape follows book count ───
    if (template === 'mosaic') {
      const POSTER_W = 600;
      const POSTER_H = 750;
      const { cols, rows } = mosaicGridDims(books.length);
      const cellCount = cols * rows;
      const slots = Array.from({ length: cellCount }, (_, i) => books[i] ?? null);
      const cellW = POSTER_W / cols;
      const cellH = POSTER_H / rows;
      /** Inset from cell edges (~2.5× prior 9% / 8% ratios); capped so a minimum cover area remains in tiny cells. */
      const padXIdeal = Math.round(cellW * 0.09 * 2.5);
      const padYIdeal = Math.round(cellH * 0.08 * 2.5);
      const padX = Math.min(Math.max(20, Math.min(50, padXIdeal)), Math.max(0, Math.floor((cellW - 40) / 2)));
      const padY = Math.min(Math.max(15, Math.min(45, padYIdeal)), Math.max(0, Math.floor((cellH - 40) / 2)));
      const innerW = cellW - 2 * padX;
      const innerH = cellH - 2 * padY;
      const coverMaxW = Math.max(36, Math.floor(Math.min(innerW, (innerH * 5) / 7)));
      const coverMaxH = Math.min(Math.round((coverMaxW * 7) / 5), Math.floor(innerH));
      const nMosaic = books.length;
      const mosaicExtraCompact = nMosaic === 8 || nMosaic === 12;
      const mosaicCoverDisplayScale = mosaicExtraCompact ? 0.96 : MOSAIC_COVER_DISPLAY_SCALE;

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
                  coverMaxW={coverMaxW}
                  coverMaxH={coverMaxH}
                  padX={padX}
                  padY={padY}
                  displayScale={mosaicCoverDisplayScale}
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
