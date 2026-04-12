import { Book, MoodType, TemplateType, TEMPLATES } from '@/types/book';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PosterCanvas } from './PosterCanvas';
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';

function PosterScaled({ year, month, entries, mood, template }: { year: number; month: number; entries: Record<number, Book>; mood: MoodType; template: TemplateType }) {
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
        <div style={{ width: 600, height: 750, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <PosterCanvas year={year} month={month} entries={entries} mood={mood} template={template} />
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    skipSnaps: false,
  });
  const [activeIndex, setActiveIndex] = useState(
    TEMPLATES.findIndex((t) => t.id === template) || 0
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setActiveIndex(idx);
    onTemplateChange(TEMPLATES[idx].id);
  }, [emblaApi, onTemplateChange]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const idx = TEMPLATES.findIndex((t) => t.id === template);
    if (idx >= 0 && idx !== emblaApi.selectedScrollSnap()) {
      emblaApi.scrollTo(idx, true);
    }
  }, [emblaApi, template]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const activeTemplate = TEMPLATES[activeIndex];

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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header - consistent position with Step1 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="px-6 pt-1 max-w-md mx-auto w-full"
      >
        <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground mt-1">
          Which days defined your month?
        </h2>
        <p className="text-xs text-muted-foreground font-body mt-0.5 mb-1">
          좌우로 스와이프하여 템플릿을 선택하세요
        </p>
      </motion.div>

      {/* Carousel — no flex-1 so content doesn’t stretch; gap to buttons via mt-6 on action bar */}
      <div className="relative flex shrink-0 flex-col justify-start py-1">
        {/* Nav arrows - desktop */}
        <button
          onClick={scrollPrev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={scrollNext}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Height from 480px track + padding; overflow-x hidden for Embla */}
        <div
          ref={emblaRef}
          className="flex h-fit w-full shrink-0 items-start overflow-hidden px-1 pt-6 pb-6 md:px-2"
        >
          <div className="flex h-[480px] max-h-[480px] min-h-0 w-full touch-pan-y items-center will-change-transform">
            {TEMPLATES.map((t, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={t.id}
                  className="flex h-[480px] max-h-[480px] min-w-0 shrink-0 flex-[0_0_70%] items-center justify-center px-1 min-[480px]:flex-[0_0_55%] md:flex-[0_0_38%] md:px-1.5"
                >
                  {/* Embla loop translates this outer slide node — no transform transition here */}
                  <div
                    className="flex h-[480px] max-h-[480px] w-full max-w-full shrink-0 items-center justify-center overflow-hidden"
                  >
                    <div
                      className="origin-center transition-[transform,opacity,filter] duration-500 ease-out motion-reduce:transition-none [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]"
                      style={{
                        transform: isActive ? 'scale(1)' : 'scale(0.88)',
                        opacity: isActive ? 1 : 0.38,
                        filter: isActive ? 'none' : 'brightness(0.55)',
                        width: '100%',
                        maxWidth: 'min(100%, 384px)',
                      }}
                    >
                      <div
                        className="mx-auto w-full overflow-hidden bg-transparent"
                        style={{
                          aspectRatio: '4/5',
                          maxHeight: 480,
                        }}
                      >
                        <PosterScaled year={year} month={month} entries={entries} mood={mood} template={t.id} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Template name + dots combined below carousel */}
        <div className="mt-2 flex shrink-0 flex-col items-center gap-2">
          <div className="text-center h-10">
            <p className="font-display font-bold text-sm text-foreground tracking-wide">{activeTemplate.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{activeTemplate.description}</p>
          </div>
          <div className="flex justify-center gap-1.5">
            {TEMPLATES.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-1 transition-all duration-300 ${
                  i === activeIndex ? 'w-6 bg-foreground' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action bar — 24px below template label / dots */}
      <div className="mt-6 flex w-full max-w-lg shrink-0 gap-3 px-6 pb-6 mx-auto">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-4 border border-border text-xs font-body tracking-[0.15em] uppercase hover:bg-secondary transition-colors rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onGenerate}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground text-xs font-body font-bold tracking-[0.15em] uppercase hover:opacity-90 transition-opacity rounded-lg"
        >
          Try This Template
        </button>
      </div>
    </div>
  );
}
