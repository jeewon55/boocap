import { useRef, useState, useEffect } from 'react';
import domtoimage from 'dom-to-image-more';
import { Download, ArrowLeft } from 'lucide-react';
import { Book, MoodType, TemplateType } from '@/types/book';
import { PosterCanvas } from './PosterCanvas';
import { motion } from 'framer-motion';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

interface Step3Props {
  year: number;
  month: number;
  entries: Record<number, Book>;
  mood: MoodType;
  template: TemplateType;
  onBack: () => void;
  onReset: () => void;
}

export function Step3Download({ year, month, entries, mood, template, onBack, onReset }: Step3Props) {
  const posterRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [downloading, setDownloading] = useState(false);
  const monthName = MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase();

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 600);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const TARGET_W = 1080;
      const TARGET_H = 1350;

      // Wait for all images to be fully loaded
      const images = posterRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((resolve) => {
                  img.onload = resolve;
                  img.onerror = resolve;
                })
        )
      );
      // Small extra delay for rendering stability
      await new Promise((r) => setTimeout(r, 300));

      const dataUrl = await domtoimage.toPng(posterRef.current, {
        width: TARGET_W,
        height: TARGET_H,
        style: {
          transform: `scale(${TARGET_W / posterRef.current.scrollWidth})`,
          transformOrigin: 'top left',
        },
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `book-recap-${MONTHS[month].toLowerCase()}-${year}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    }
    setDownloading(false);
  };

  const scaledW = 600 * scale;
  const scaledH = 750 * scale;

  return (
    <div className="flex-1 flex flex-col px-6 overflow-auto">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="self-start mb-4"
        >
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-primary mt-2">
            Your {monthName}, beautifully visualized.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full flex justify-center flex-1 min-h-0"
        >
          <div
            ref={wrapperRef}
            className="w-full overflow-hidden rounded-[12px] flex justify-center"
            style={{
              aspectRatio: '4/5',
              maxWidth: 420,
              boxShadow: '0 0 60px rgba(223, 255, 0, 0.15), 0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ width: scaledW, height: scaledH, overflow: 'hidden', flexShrink: 0, borderRadius: 'inherit' }}>
              <div style={{ width: 600, height: 750, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <PosterCanvas
                  ref={posterRef}
                  year={year}
                  month={month}
                  entries={entries}
                  mood={mood}
                  template={template}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="py-4 max-w-md mx-auto w-full space-y-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground text-xs font-body font-bold tracking-[0.15em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50 rounded-lg"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading ? 'EXPORTING...' : 'DOWNLOAD IMAGE'}
        </button>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-border text-xs font-body tracking-[0.15em] uppercase hover:bg-secondary transition-colors rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-3 border border-border text-xs font-body tracking-[0.15em] uppercase hover:bg-secondary transition-colors rounded-lg"
          >
            처음부터 다시
          </button>
        </div>
      </div>
    </div>
  );
}
