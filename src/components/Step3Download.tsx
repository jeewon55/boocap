import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [downloading, setDownloading] = useState(false);
  const monthName = MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase();

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const maxH = window.innerHeight * 0.55;
        const scaleByW = w / 600;
        const scaleByH = maxH / 750; // 600 * 5/4 = 750
        setScale(Math.min(scaleByW, scaleByH, 0.75));
      }
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    window.addEventListener('resize', update);
    return () => { obs.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      // Fixed 4:5 ratio output: 1080x1350
      const TARGET_W = 1080;
      const TARGET_H = 1350;
      const srcW = posterRef.current.scrollWidth;
      const srcH = posterRef.current.scrollHeight;
      const renderScale = TARGET_W / srcW;

      const raw = await html2canvas(posterRef.current, {
        scale: renderScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: srcW,
        height: srcH,
      });

      // Crop/fit to exact 1080x1350
      const out = document.createElement('canvas');
      out.width = TARGET_W;
      out.height = TARGET_H;
      const ctx = out.getContext('2d')!;
      ctx.drawImage(raw, 0, 0, TARGET_W, TARGET_H, 0, 0, TARGET_W, TARGET_H);

      const link = document.createElement('a');
      link.download = `book-recap-${MONTHS[month].toLowerCase()}-${year}.png`;
      link.href = out.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    }
    setDownloading(false);
  };

  return (
    <div className="flex-1 flex flex-col px-6 overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full min-h-0">
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
          ref={containerRef}
          className="w-full flex justify-center flex-1 min-h-0"
        >
          <div
            className="origin-top rounded-xl overflow-hidden"
            style={{
              width: 600,
              aspectRatio: '4/5',
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              boxShadow: '0 0 60px rgba(223, 255, 0, 0.15), 0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <PosterCanvas
              ref={posterRef}
              year={year}
              month={month}
              entries={entries}
              mood={mood}
              template={template}
            />
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
