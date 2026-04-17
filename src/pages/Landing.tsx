import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useLocale, type Locale } from '@/contexts/LocaleContext';
import { formatMonthYear, landingMessages } from '@/i18n/landing';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDefaultMonth() {
  const now = new Date();
  let m = now.getMonth() - 1;
  let y = now.getFullYear();
  if (m < 0) {
    m = 11;
    y -= 1;
  }
  return { year: y, month: m };
}

function LandingPosterMock({
  month,
  year,
  locale,
  monthLabel,
  booksLabel,
  tiltClass,
  scaleClass,
}: {
  month: number;
  year: number;
  locale: Locale;
  monthLabel: string;
  booksLabel: string;
  tiltClass: string;
  scaleClass: string;
}) {
  return (
    <div
      className={`shrink-0 origin-bottom shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] transition-transform duration-500 ${tiltClass} ${scaleClass}`}
    >
      <div className="w-[min(72vw,220px)] sm:w-[240px] md:w-[260px] border border-foreground/15 bg-card aspect-[4/5] flex flex-col p-5 md:p-6 rounded-[2px]">
        <div>
          <p className="text-[8px] md:text-[9px] font-body font-semibold uppercase tracking-[0.35em] text-foreground">
            {monthLabel}
          </p>
          <p className="font-display text-xl md:text-2xl font-bold tracking-[0] mt-2 text-foreground">
            {locale === 'ko' ? `${month + 1}월` : MONTHS[month]}
          </p>
          <p className="text-muted-foreground text-[10px] md:text-[11px] font-body tabular-nums mt-0.5">{year}</p>
        </div>

        <div className="grid grid-cols-3 gap-1.5 md:gap-2 my-4 md:my-6 flex-1 content-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] border border-border bg-muted rounded-[1px]"
              style={{
                backgroundImage: `linear-gradient(135deg, hsl(0 0% ${88 - i * 3}%) 0%, hsl(0 0% ${78 - i * 4}%) 100%)`,
              }}
            />
          ))}
        </div>

        <div className="flex justify-between items-end pt-2 border-t border-border">
          <div>
            <p className="font-display text-2xl md:text-3xl font-bold tabular-nums leading-none tracking-[0]">6</p>
            <p className="text-muted-foreground text-[8px] md:text-[9px] font-body tracking-[0.2em] uppercase mt-1">
              {booksLabel}
            </p>
          </div>
          <div className="flex gap-0.5 items-end h-10 md:h-12">
            {[20, 45, 30, 60, 50, 35].map((h, i) => (
              <div key={i} className="w-1.5 bg-foreground/25 rounded-[1px]" style={{ height: `${h * 0.4}px` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = landingMessages[locale];
  const { year: defYear, month: defMonth } = getDefaultMonth();
  const [year, setYear] = useState(defYear);
  const [month, setMonth] = useState(defMonth);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    const onPointerDown = (e: PointerEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showPicker]);

  const handleCreate = () => {
    navigate(`/create?year=${year}&month=${month}`);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-foreground">
      <nav className="flex shrink-0 items-center justify-center px-6 pt-2 pb-4">
        <span className="font-display text-[20px] font-bold tracking-[0] uppercase">
          Boocap
        </span>
      </nav>

      <main className="flex flex-1 flex-col">
        {/* Hero — centered copy + pills */}
        <section className="flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-6 text-center md:pb-12 md:pt-10">
          <h1 className="max-w-[20rem] font-display text-[1.65rem] font-extrabold leading-[1.15] tracking-[-0.03em] text-foreground sm:max-w-xl sm:text-4xl sm:leading-[1.12] md:max-w-2xl md:text-5xl md:leading-[58px]">
            {t.heroSingleLines ? (
              <>
                {t.heroSingleLines[0]}
                <br />
                {t.heroSingleLines[1]}
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">
                  {t.heroLine1}
                  <span className="text-foreground">{t.heroAccent}</span>
                </span>
                <br />
                {t.heroLine2}
              </>
            )}
          </h1>

          <p className="mx-auto mt-2.5 max-w-md text-pretty text-[15px] font-body font-normal leading-relaxed text-[hsl(0_0%_38%)] sm:mt-3 sm:text-base md:mt-4 md:max-w-lg md:text-[17px] md:leading-relaxed">
            {t.subhead}
            {t.subheadSecond ? (
              <>
                <br />
                {t.subheadSecond}
              </>
            ) : null}
          </p>

          <div className="mx-auto mt-10 flex w-full max-w-[26rem] flex-col gap-3 sm:flex-row sm:items-stretch">
            <div ref={pickerRef} className="relative">
              <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="flex h-12 w-full min-w-[200px] items-center gap-3 rounded-[4px] border border-border bg-card px-4 text-left text-xs font-body font-medium tracking-normal text-foreground transition-colors hover:bg-muted/60 sm:w-auto"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-foreground" strokeWidth={1.5} />
                <span>{formatMonthYear(locale, month, year, MONTHS)}</span>
              </button>

              {showPicker ? (
                <div className="absolute top-full left-0 z-20 mt-2 min-w-[280px] border border-border bg-card p-4 shadow-[8px_8px_0_0_rgba(0,0,0,0.06)]">
                  <div className="mb-3 flex flex-wrap gap-1">
                    {years.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setYear(y)}
                        className={`rounded-[4px] border px-2.5 py-1.5 text-[10px] font-body font-medium tracking-normal transition-colors ${
                          y === year
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-border">
                    {t.monthPickerLabels.map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setMonth(i);
                          setShowPicker(false);
                        }}
                        className={`rounded-[4px] bg-card py-2.5 text-[10px] font-body font-medium tracking-normal transition-colors ${
                          i === month
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="flex h-12 items-center justify-center gap-2 rounded-[4px] bg-foreground px-8 font-display text-[11px] font-semibold tracking-normal text-background transition-opacity hover:opacity-90"
            >
              {t.createRecap}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </section>

        {/* Product strip — bottom-cropped row */}
        <section
          id="landing-preview"
          className="relative mt-auto flex min-h-[min(42vh,320px)] w-full justify-center overflow-hidden pb-0 pt-4 md:min-h-[min(46vh,420px)] md:pt-8"
        >
          <div className="pointer-events-none flex w-full max-w-5xl items-end justify-center gap-2 px-2 sm:gap-4 md:gap-8">
            <LandingPosterMock
              month={month}
              year={year}
              locale={locale}
              monthLabel={t.monthlyRecap}
              booksLabel={t.booksLabel}
              tiltClass="-rotate-[4deg] translate-y-4 md:translate-y-6"
              scaleClass="scale-[0.92] md:scale-95"
            />
            <LandingPosterMock
              month={month}
              year={year}
              locale={locale}
              monthLabel={t.monthlyRecap}
              booksLabel={t.booksLabel}
              tiltClass="rotate-0 z-[1] -translate-y-1 md:-translate-y-2"
              scaleClass="scale-100"
            />
            <LandingPosterMock
              month={month}
              year={year}
              locale={locale}
              monthLabel={t.monthlyRecap}
              booksLabel={t.booksLabel}
              tiltClass="rotate-[4deg] translate-y-4 md:translate-y-6"
              scaleClass="scale-[0.92] md:scale-95"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[hsl(0_0%_96%)] to-transparent md:h-32" />
        </section>
      </main>
    </div>
  );
}
