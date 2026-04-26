import {
  Book,
  MoodType,
  TemplateType,
  countBooksInEntries,
  visibleTemplatesForBookCount,
} from '@/types/book';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PosterCanvas } from './PosterCanvas';
import { useRef, useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { useLocale, type Locale } from '@/contexts/LocaleContext';
import { createFlowMessages } from '@/i18n/createFlow';

function PosterScaled({
  year,
  month,
  entries,
  mood,
  template,
  posterLocale,
}: {
  year: number;
  month: number;
  entries: Record<number, Book>;
  mood: MoodType;
  template: TemplateType;
  posterLocale: Locale;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 600);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scaledW = 600 * scale;
  const scaledH = 750 * scale;

  return (
    <div
      ref={wrapperRef}
      className="w-full flex justify-center max-w-full"
      style={{ aspectRatio: '4/5', overflow: 'hidden' }}
    >
      <div style={{ width: scaledW, height: scaledH, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: 600, height: 750, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
          <PosterCanvas
            year={year}
            month={month}
            entries={entries}
            mood={mood}
            template={template}
            posterLocale={posterLocale}
          />
        </div>
      </div>
    </div>
  );
}

interface Step2Props {
  year: number;
  month: number;
  entries: Record<number, Book>;
  mood: MoodType;
  template: TemplateType;
  onTemplateChange: (t: TemplateType) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export function Step2Template({ year, month, entries, mood, template, onTemplateChange, onBack, onGenerate }: Step2Props) {
  const { locale } = useLocale();
  const flow = createFlowMessages[locale];
  const bookCount = useMemo(() => countBooksInEntries(entries), [entries]);
  const visibleTemplates = useMemo(
    () => visibleTemplatesForBookCount(bookCount),
    [bookCount],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    skipSnaps: false,
  });
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, visibleTemplatesForBookCount(countBooksInEntries(entries)).findIndex((t) => t.id === template)),
  );

  useLayoutEffect(() => {
    if (visibleTemplates.length === 0) return;
    if (!visibleTemplates.some((t) => t.id === template)) {
      onTemplateChange(visibleTemplates[0]!.id);
    }
  }, [template, visibleTemplates, onTemplateChange]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setActiveIndex(idx);
    const picked = visibleTemplates[idx];
    if (picked) onTemplateChange(picked.id);
  }, [emblaApi, onTemplateChange, visibleTemplates]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const idx = Math.max(0, visibleTemplates.findIndex((t) => t.id === template));
    setActiveIndex(idx);
  }, [template, visibleTemplates]);

  useEffect(() => {
    if (!emblaApi) return;
    const idx = Math.max(0, visibleTemplates.findIndex((t) => t.id === template));
    if (idx >= 0 && idx !== emblaApi.selectedScrollSnap()) {
      emblaApi.scrollTo(idx, true);
    }
  }, [emblaApi, template, visibleTemplates]);

  /** Re-init only when the slide list changes (book-count thresholds), not on every swipe. */
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, bookCount, visibleTemplates]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const activeTemplate = visibleTemplates[activeIndex] ?? visibleTemplates[0]!;

  useEffect(() => {
    if (!emblaApi) return;
    const root = emblaApi.rootNode();
    if (!root) return;
    const ro = new ResizeObserver(() => {
      emblaApi.reInit();
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [emblaApi]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden px-4 sm:px-6">
      {/* Header — same shell as Step1 “Mark Your Days.” */}
      <div className="mx-auto w-full max-w-[26rem] shrink-0 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center"
        >
          <h2 className="mt-2 mb-2 font-display text-[20px] font-extrabold leading-none tracking-[0] text-[#d6d6d6]">
            {flow.frameYourMonthTitle}
          </h2>
        </motion.div>
      </div>

      {/* Carousel — no flex-1 so content doesn't stretch; gap to buttons via mt-6 on action bar */}
      <div className="relative flex shrink-0 flex-col justify-start py-1 md:w-full md:max-w-[960px] md:mx-auto md:overflow-hidden">
        {/* Nav arrows - desktop */}
        <button
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[4px] border border-border bg-card text-foreground transition-colors hover:bg-muted md:flex"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[4px] border border-border bg-card text-foreground transition-colors hover:bg-muted md:flex"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Height from 480px track + padding; overflow-x hidden for Embla */}
        <div
          ref={emblaRef}
          className="flex h-fit w-full shrink-0 items-start overflow-hidden px-1 pt-6 pb-1 md:px-2"
        >
          <div className="flex h-[480px] max-h-[480px] min-h-0 w-full touch-pan-y items-center will-change-transform">
            {visibleTemplates.map((t, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={t.id}
                  className="flex h-[480px] max-h-[480px] min-w-0 shrink-0 flex-[0_0_82%] items-center justify-center px-1.5 min-[480px]:flex-[0_0_66%] md:flex-[0_0_33.33%] md:px-3"
                >
                  {/* Embla loop translates this outer slide node — no transform transition here */}
                  <div
                    className="flex h-[480px] max-h-[480px] w-full max-w-full shrink-0 items-center justify-center"
                  >
                    <div
                      className="origin-center transition-[transform,opacity,filter] duration-500 ease-out motion-reduce:transition-none [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]"
                      style={{
                        transform: isActive ? 'scale(1)' : 'scale(0.88)',
                        opacity: isActive ? 1 : 0.38,
                        filter: isActive
                          ? 'drop-shadow(0 4px 20px rgba(0,0,0,0.10)) drop-shadow(0 1px 6px rgba(0,0,0,0.05))'
                          : 'brightness(0.55) drop-shadow(0 2px 10px rgba(0,0,0,0.06))',
                        width: '100%',
                        maxWidth: 'min(100%, 384px)',
                      }}
                    >
                      <div
                        className="mx-auto w-full overflow-hidden bg-transparent ring-1 ring-inset ring-black/[0.08] rounded-[12px]"
                        style={{
                          aspectRatio: '4/5',
                          maxHeight: 480,
                        }}
                      >
                        <PosterScaled
                          year={year}
                          month={month}
                          entries={entries}
                          mood={mood}
                          template={t.id}
                          posterLocale={locale}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Template name + dots combined below carousel */}
        <div className="mt-1 flex shrink-0 flex-col items-center gap-4">
          <div className="text-center">
            <p className="font-display text-sm font-bold tracking-[0] text-foreground">{activeTemplate.label}</p>
          </div>
          <div className="flex h-2 items-center justify-center gap-2">
            {visibleTemplates.map((t, i) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Go to template ${i + 1}`}
                aria-current={i === activeIndex ? 'true' : undefined}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`shrink-0 rounded-full p-0 leading-[0] transition-all duration-300 ${
                  i === activeIndex ? 'h-2 w-2 bg-foreground' : 'h-1.5 w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action bar — 24px below template label / dots */}
      <div className="mx-auto mt-6 w-full max-w-[26rem] shrink-0 pb-[max(1.5rem,calc(1.5rem+env(safe-area-inset-bottom,0px)))]">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 rounded-[4px] border border-border px-6 py-4 text-xs font-body font-medium tracking-normal transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {flow.templateStepBack}
          </button>
          <button
            onClick={onGenerate}
            className="flex flex-1 items-center justify-center gap-2 rounded-[4px] bg-primary py-4 text-xs font-body font-semibold tracking-normal text-primary-foreground transition-opacity hover:opacity-90"
          >
            {flow.tryThisTemplateCta}
          </button>
        </div>
      </div>
    </div>
  );
}
