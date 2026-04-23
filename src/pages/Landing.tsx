import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { landingMessages } from '@/i18n/landing';
import { LANDING_EXAMPLE_POSTER_DEFS } from '@/data/landingExamplePosters';

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
        className="relative aspect-[4/5] w-[min(50.7vw,172px)] overflow-hidden rounded-[4px] bg-white shadow-[0_-10px_28px_-12px_rgba(0,0,0,0.07),0_6px_20px_-8px_rgba(0,0,0,0.06),0_24px_48px_-12px_rgba(0,0,0,0.14)] [transform:translateZ(0)] md:w-[min(122.2vw,372px)] lg:w-[406px] xl:w-[439px]"
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

  const handleCreate = () => {
    const { year, month } = getDefaultMonth();
    navigate(`/create?year=${year}&month=${month}`);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-x-hidden bg-white pb-0 text-foreground max-md:h-[100dvh] max-md:max-h-[100dvh] max-md:overflow-hidden md:pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="grid shrink-0 grid-cols-[minmax(2.75rem,1fr)_auto_minmax(2.75rem,1fr)] items-center px-4 pt-[max(0.35rem,env(safe-area-inset-top,0px))] pb-2 max-md:pb-1.5 md:pb-4 sm:px-6 md:pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
        <div aria-hidden className="min-w-0" />
        <span className="text-center font-display text-[16px] font-bold tracking-[0] uppercase md:text-[20px]">
          Boocap
        </span>
        <div aria-hidden className="min-w-0" />
      </nav>

      <main className="flex min-h-0 flex-1 flex-col max-md:min-h-0 md:min-h-0">
        {/* Copy — 모바일: 맨 위 / md+: 히어로 중앙 + CTA 동반 */}
        <section className="shrink-0 px-4 pt-8 text-center max-md:pb-4 sm:px-6 md:flex md:flex-1 md:flex-col md:items-center md:justify-center md:px-6 md:pb-8 md:pt-10">
          <h1 className="mx-auto max-w-[20rem] font-display text-[1.45rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-foreground max-md:max-w-[min(100%,19rem)] sm:max-w-xl sm:text-4xl sm:leading-[1.12] md:max-w-2xl md:text-5xl md:leading-[58px]">
            {t.heroSingleLines ? (
              <>
                {t.heroSingleLines[0]}
                <br />
                {t.heroSingleLines[1]}
              </>
            ) : (
              <>
                <span className="max-md:inline-block md:whitespace-nowrap">
                  {t.heroLine1}
                  <span className="text-foreground">{t.heroAccent}</span>
                </span>
                <br />
                {t.heroLine2}
              </>
            )}
          </h1>

          <p className="mx-auto mt-1.5 max-w-md text-pretty text-[14px] font-body font-normal leading-snug text-[hsl(0_0%_38%)] max-md:mt-1.5 max-md:leading-relaxed sm:mt-3 sm:text-base md:mt-4 md:max-w-lg md:text-[17px] md:leading-relaxed">
            {t.subhead}
            {t.subheadSecond ? (
              <>
                <br />
                {t.subheadSecond}
              </>
            ) : null}
          </p>

          <div className="mx-auto mt-10 hidden w-full max-w-xs justify-center md:mt-10 md:flex md:max-w-none">
            <button
              type="button"
              onClick={handleCreate}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-foreground px-8 font-display text-[11px] font-semibold tracking-normal text-background transition-opacity hover:opacity-90 md:w-auto"
            >
              {t.createRecap}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </section>

        {/* 포스터 — 모바일: 남는 높이 안에 축소 · md+: 기존 대형 스트립 */}
        <section
          id="landing-preview"
          className="relative flex w-full min-h-0 flex-1 flex-col items-start justify-center overflow-hidden pb-0 pt-1 max-md:min-h-0 max-md:flex-1 max-md:pt-0 md:mt-auto md:min-h-[min(48vh,710px)] md:flex-none md:flex-row md:items-start md:justify-center md:pt-8"
        >
          <div className="pointer-events-none flex w-full max-w-5xl items-end justify-center gap-0 px-1 max-md:max-h-full max-md:pb-0 sm:gap-2 md:gap-2.5 md:px-2">
            {LANDING_EXAMPLE_POSTER_DEFS.map((def, i) => {
              const src = locale === 'ko' ? def.imgKo : def.imgEn;
              const alt = locale === 'ko' ? def.altKo : def.altEn;
              const tiltScale =
                i === 0
                  ? {
                      tiltClass:
                        'relative z-[2] -rotate-[2deg] translate-x-0.5 translate-y-0.5 md:-rotate-[4deg] md:translate-x-5 md:translate-y-6',
                      scaleClass: 'scale-[0.92] md:scale-95',
                    }
                  : i === 1
                    ? {
                        tiltClass: 'relative z-0 rotate-0 translate-y-0 md:-translate-y-2',
                        scaleClass: 'scale-100',
                      }
                    : {
                      tiltClass:
                        'relative z-[2] rotate-[2deg] -translate-x-0.5 translate-y-0.5 md:rotate-[4deg] md:-translate-x-5 md:translate-y-6',
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
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent max-md:h-12 md:h-32" />
        </section>

        {/* 모바일만: 맨 아래 CTA */}
        <div className="shrink-0 px-4 pb-[max(0.5rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))] pt-2 md:hidden">
          <div className="mx-auto w-full max-w-xs">
            <button
              type="button"
              onClick={handleCreate}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-foreground px-8 font-display text-[11px] font-semibold tracking-normal text-background transition-opacity hover:opacity-90"
            >
              {t.createRecap}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
