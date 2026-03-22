import { Book, MoodType, TemplateType, TEMPLATES } from '@/types/book';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PosterCanvas } from './PosterCanvas';
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

function PosterScaled({ year, month, entries, mood, template, maxH }: { year: number; month: number; entries: Record<number, Book>; mood: MoodType; template: TemplateType; maxH?: string }) {
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

  return (
    <div
      ref={wrapperRef}
      className={`w-full ${maxH ?? ''}`}
      style={{ aspectRatio: '4/5' }}
    >
      <div style={{ width: 600, height: 750, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <PosterCanvas year={year} month={month} entries={entries} mood={mood} template={template} />
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

  const monthName = MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase();

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header - consistent position with Step1 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="px-6 pt-2 max-w-md mx-auto w-full"
      >
        <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-primary mt-2">
          Which days defined your month?
        </h2>
        <p className="text-xs text-muted-foreground font-body mt-1 mb-2">
          좌우로 스와이프하여 템플릿을 선택하세요
        </p>
      </motion.div>

      {/* Carousel */}
      <div className="flex-1 flex flex-col justify-center relative min-h-0 py-2 min-h-[55vh]">
        {/* Nav arrows - desktop */}
        <button
          onClick={scrollPrev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-secondary hover:bg-muted backdrop-blur-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={scrollNext}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-secondary hover:bg-muted backdrop-blur-sm transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <div ref={emblaRef} className="overflow-hidden px-4">
          <div className="flex touch-pan-y items-center">
            {TEMPLATES.map((t, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={t.id}
                  className="flex-[0_0_55%] md:flex-[0_0_35%] min-w-0 px-2"
                  style={{
                    transform: isActive ? 'scale(1.05)' : 'scale(0.82)',
                    opacity: isActive ? 1 : 0.35,
                    filter: isActive ? 'none' : 'brightness(0.5)',
                    transition: 'transform 0.5s cubic-bezier(0.25,1,0.5,1), opacity 0.4s ease, filter 0.4s ease',
                  }}
                >
                  <div className="rounded-xl overflow-hidden shadow-2xl border border-border/30">
                    <PosterScaled year={year} month={month} entries={entries} mood={mood} template={t.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Template name + dots combined below carousel */}
        <div className="flex flex-col items-center mt-3 gap-2">
          <div className="text-center h-10">
            <p className="font-display font-bold text-sm text-primary">{activeTemplate.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{activeTemplate.description}</p>
          </div>
          <div className="flex justify-center gap-1.5">
            {TEMPLATES.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'bg-primary w-5' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="py-4 px-6 max-w-lg mx-auto w-full flex gap-3">
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
