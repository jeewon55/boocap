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
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.download = `book-recap-${MONTHS[month].toLowerCase()}-${year}.png`;
      link.href = canvas.toDataURL('image/png');
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
          <p className="text-[10px] tracking-[0.3em] text-muted-foreground font-body uppercase mb-1">Step 3</p>
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-primary">
            Your {monthName}, beautifully visualized.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          ref={containerRef}
          className="w-full flex justify-center"
        >
          <div
            className="origin-top rounded-xl overflow-hidden"
            style={{
              width: 600,
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
