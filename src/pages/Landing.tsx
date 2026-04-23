import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { formatMonthYear, landingMessages } from '@/i18n/landing';
import { LANDING_EXAMPLE_POSTER_DEFS } from '@/data/landingExamplePosters';

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

function LandingExamplePoster({
  src,
  alt,
  tiltClass,
  scaleClass,
}: {
  src: string;
  alt: string;
  tiltClass: string;
  scaleClass: string;
}) {
  return (
    <div
      className={`shrink-0 origin-bottom transition-transform duration-500 will-change-transform ${tiltClass} ${scaleClass}`}
    >
      <div
        className="relative aspect-[4/5] w-[min(94vw,286px)] overflow-hidden rounded-[4px] bg-white shadow-[0_-10px_28px_-12px_rgba(0,0,0,0.07),0_6px_20px_-8px_rgba(0,0,0,0.06),0_24px_48px_-12px_rgba(0,0,0,0.14)] [transform:translateZ(0)] sm:w-[312px] md:w-[338px]"
        style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
      >
        <img
          src={src}
          alt={alt}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[103%] w-[103%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-center select-none"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
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
                  <div className="grid grid-cols-3 gap-px bg-card">
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

        {/* Product strip — locale picks `imgEn` / `imgKo` from `public/landing-examples/` */}
        <section
          id="landing-preview"
          className="relative mt-auto flex min-h-[min(44vh,416px)] w-full justify-center overflow-hidden pb-0 pt-4 md:min-h-[min(48vh,546px)] md:pt-8"
        >
          <div className="pointer-events-none flex w-full max-w-5xl items-end justify-center gap-1 px-2 sm:gap-2 md:gap-2.5">
            {LANDING_EXAMPLE_POSTER_DEFS.map((def, i) => {
              const src = locale === 'ko' ? def.imgKo : def.imgEn;
              const alt = locale === 'ko' ? def.altKo : def.altEn;
              const tiltScale =
                i === 0
                  ? {
                      tiltClass:
                        'relative z-[2] -rotate-[4deg] translate-x-3 translate-y-4 sm:translate-x-4 md:translate-x-5 md:translate-y-6',
                      scaleClass: 'scale-[0.92] md:scale-95',
                    }
                  : i === 1
                    ? {
                        tiltClass: 'relative z-0 rotate-0 -translate-y-1 md:-translate-y-2',
                        scaleClass: 'scale-100',
                      }
                    : {
                      tiltClass:
                        'relative z-[2] rotate-[4deg] -translate-x-3 translate-y-4 sm:-translate-x-4 md:-translate-x-5 md:translate-y-6',
                      scaleClass: 'scale-[0.92] md:scale-95',
                    };
              return (
                <LandingExamplePoster
                  key={def.id}
                  src={src}
                  alt={alt}
                  tiltClass={tiltScale.tiltClass}
                  scaleClass={tiltScale.scaleClass}
                />
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent md:h-32" />
        </section>
      </main>
    </div>
  );
}
