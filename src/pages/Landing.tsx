import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { landingMessages } from '@/i18n/landing';
import { getLandingCarouselItems } from '@/data/landingExamplePosters';
import { cn } from '@/lib/utils';

/** Mobile-only Y rotation for carousel “wheel”; md+ uses flat layout via `md:contents`. */
const LANDING_POSTER_WHEEL_Y: Record<number, string> = {
  0: 'max-md:[transform:rotateY(24deg)] max-md:motion-reduce:transform-none',
  1: 'max-md:[transform:rotateY(0deg)_translateZ(32px)] max-md:motion-reduce:transform-none',
  2: 'max-md:[transform:rotateY(-24deg)] max-md:motion-reduce:transform-none',
};

function landingPosterWheelY(i: number) {
  return LANDING_POSTER_WHEEL_Y[i] ?? 'max-md:motion-reduce:transform-none';
}

function landingPosterWheelYSlot(i: number, total: number) {
  if (total === 5) {
    if (i === 0) return landingPosterWheelY(0);
    if (i === 1) return 'max-md:[transform:rotateY(14deg)] max-md:motion-reduce:transform-none';
    if (i === 2) return landingPosterWheelY(1);
    if (i === 3) return 'max-md:[transform:rotateY(-14deg)] max-md:motion-reduce:transform-none';
    if (i === 4) return landingPosterWheelY(2);
  }
  return landingPosterWheelY(i);
}

type TiltScale = { tiltClass: string; scaleClass: string };

const LANDING_TILT_SCALE_3: readonly TiltScale[] = [
  {
    tiltClass:
      'relative z-[2] -rotate-[2deg] translate-x-0.5 translate-y-0.5 md:-rotate-[4deg] md:translate-x-5 md:translate-y-6',
    scaleClass: 'scale-[0.92] md:scale-95',
  },
  {
    tiltClass: 'relative z-0 rotate-0 translate-y-0 md:-translate-y-2',
    scaleClass: 'scale-100',
  },
  {
    tiltClass:
      'relative z-[2] rotate-[2deg] -translate-x-0.5 translate-y-0.5 md:rotate-[4deg] md:-translate-x-5 md:translate-y-6',
    scaleClass: 'scale-[0.92] md:scale-95',
  },
];

function getLandingTiltScale(i: number, total: number): TiltScale {
  if (total === 5) {
    if (i === 0) return LANDING_TILT_SCALE_3[0];
    if (i === 1)
      return {
        tiltClass:
          'relative z-[1] -rotate-[1.5deg] translate-x-0.5 translate-y-0.5 md:-rotate-[3deg] md:translate-x-3 md:translate-y-4',
        scaleClass: 'scale-[0.94] md:scale-[0.97]',
      };
    if (i === 2) return LANDING_TILT_SCALE_3[1];
    if (i === 3)
      return {
        tiltClass:
          'relative z-[1] rotate-[1.5deg] -translate-x-0.5 translate-y-0.5 md:rotate-[3deg] md:-translate-x-3 md:translate-y-4',
        scaleClass: 'scale-[0.94] md:scale-[0.97]',
      };
    if (i === 4) return LANDING_TILT_SCALE_3[2];
  }
  return LANDING_TILT_SCALE_3[Math.min(Math.max(i, 0), 2)];
}

function getDefaultMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  if (now.getDate() >= 15) {
    return { year: y, month: m };
  }
  return m === 0 ? { year: y - 1, month: 11 } : { year: y, month: m - 1 };
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
      {/* 그림자는 overflow 바깥 래퍼에 두어 이미지 마스크와 분리 */}
      <div className="rounded-[4px] shadow-[0_-10px_28px_-12px_rgba(0,0,0,0.07),0_6px_20px_-8px_rgba(0,0,0,0.06),0_24px_48px_-12px_rgba(0,0,0,0.14)]">
        <div
          className="relative aspect-[4/5] w-[min(60.84vw,206px)] overflow-hidden rounded-[4px] bg-white md:w-[min(117.312vw,357px)] lg:w-[390px] xl:w-[422px]"
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
    </div>
  );
}

const MD_BREAKPOINT_PX = 768;

export default function Landing() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = landingMessages[locale];
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const carouselItems = useMemo(() => getLandingCarouselItems(locale), [locale]);
  const carouselCenterIndex = Math.floor(carouselItems.length / 2);

  /** 모바일 가로 캐러셀: 첫 페인트·리사이즈마다 가운데(두 번째) 포스터를 뷰포트 중앙에 맞춤 */
  const centerMobileCarousel = useCallback(() => {
    const viewport = mobileCarouselRef.current;
    if (!viewport || typeof window === 'undefined' || window.innerWidth >= MD_BREAKPOINT_PX) return;
    const centerEl = viewport.querySelector('[data-landing-carousel-center]') as HTMLElement | null;
    if (!centerEl) return;
    const v = viewport.getBoundingClientRect();
    const c = centerEl.getBoundingClientRect();
    const delta = c.left + c.width / 2 - (v.left + v.width / 2);
    viewport.scrollLeft += Math.round(delta);
  }, []);

  useLayoutEffect(() => {
    centerMobileCarousel();
    const el = mobileCarouselRef.current;
    if (!el) return undefined;
    const inner = el.querySelector('[data-landing-poster-strip]');
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => centerMobileCarousel());
    });
    ro.observe(el);
    if (inner) ro.observe(inner);
    window.addEventListener('resize', centerMobileCarousel);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', centerMobileCarousel);
    };
  }, [centerMobileCarousel, locale, carouselItems.length]);

  const handleCreate = () => {
    const { year, month } = getDefaultMonth();
    navigate(`/create?year=${year}&month=${month}`);
  };

  return (
    <div className="landing-tall-root flex min-h-[100dvh] flex-col overflow-x-hidden bg-white pb-0 text-foreground max-md:h-[100dvh] max-md:max-h-[100dvh] md:pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="grid shrink-0 grid-cols-[minmax(2.75rem,1fr)_auto_minmax(2.75rem,1fr)] items-center px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-2 max-md:pb-1.5 md:pb-4 sm:px-6 md:pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <div aria-hidden className="min-w-0" />
        <img src="/logo.png" alt="Boocap" className="h-4 w-auto md:h-5 opacity-100" />
        <div aria-hidden className="min-w-0" />
      </nav>

      <main className="landing-tall-main flex min-h-0 flex-1 flex-col max-md:min-h-0 md:min-h-0">
        {/* Copy — 모바일: 맨 위 / md+: 히어로 중앙 + CTA 동반 */}
        <section className="landing-tall-hero shrink-0 px-4 pt-14 text-center max-md:pb-4 sm:px-6 md:flex md:flex-none md:flex-col md:items-center md:justify-center md:px-6 md:pb-[40px] md:pt-[72px]">
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
          className="landing-tall-preview relative z-0 flex w-full min-h-0 flex-1 flex-col items-start justify-center [overflow-x:clip] overflow-y-visible pb-0 pt-1 max-md:min-h-0 max-md:flex-1 max-md:overflow-x-visible max-md:pt-0 max-md:pb-4 md:mt-auto md:min-h-[min(48vh,710px)] md:flex-none md:flex-row md:items-center md:justify-center md:[overflow-x:clip] md:overflow-y-visible md:pb-6 md:pt-6"
        >
          {/* 모바일: overflow-x-auto 시 overflow-y가 auto로 바뀌어 그림자가 잘림 → 안쪽에 pb로 스크롤 박스 안에 그림자 공간 확보 */}
          <div
            ref={mobileCarouselRef}
            className="pointer-events-none max-md:pointer-events-auto relative z-10 w-full min-w-0 max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:overflow-y-hidden max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden motion-reduce:max-md:snap-none md:overflow-visible"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div
              data-landing-poster-strip
              className={cn(
                'pointer-events-none max-md:pointer-events-auto flex items-end justify-center gap-0 px-1 max-md:w-max max-md:justify-start max-md:gap-3 max-md:px-[max(0.75rem,calc(50vw-min(30.42vw,103px)-2.25rem))] max-md:pb-14 max-md:pt-2',
                'max-md:[perspective:min(100vw,960px)] max-md:[perspective-origin:50%_90%] max-md:[transform-style:preserve-3d]',
                'w-full max-w-5xl md:mx-auto md:gap-2.5 md:justify-center md:px-2 md:pb-0 md:pt-0',
              )}
            >
              {carouselItems.map((item, i) => {
                const tiltScale = getLandingTiltScale(i, carouselItems.length);
                return (
                  <div
                    key={item.id}
                    data-landing-carousel-center={i === carouselCenterIndex ? '' : undefined}
                    className="snap-center shrink-0 max-md:snap-always md:contents"
                  >
                    <div
                      className={cn(
                        'origin-bottom transition-transform duration-500 ease-out will-change-transform max-md:[transform-style:preserve-3d] md:contents',
                        landingPosterWheelYSlot(i, carouselItems.length),
                      )}
                    >
                      <LandingExamplePoster
                        src={item.src}
                        alt={item.alt}
                        tiltClass={tiltScale.tiltClass}
                        scaleClass={tiltScale.scaleClass}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* z-0: 포스터·그림자(z-10) 아래에만 깔려 잘린 듯한 가로선이 생기지 않게 함 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-16 bg-gradient-to-t from-white/85 via-white/35 to-transparent max-md:h-20 md:h-32" />
        </section>

        {/* 모바일만: 맨 아래 CTA */}
        <div className="shrink-0 px-4 pb-[max(2rem,calc(2rem+env(safe-area-inset-bottom,0px)))] pt-2 md:hidden">
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
