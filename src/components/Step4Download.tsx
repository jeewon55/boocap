import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Download, ArrowLeft } from 'lucide-react';
import { Book, MoodType, TemplateType } from '@/types/book';
import { PosterCanvas } from './PosterCanvas';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

interface Step4Props {
  year: number;
  month: number;
  entries: Record<number, Book>;
  mood: MoodType;
  template: TemplateType;
  onBack: () => void;
  onReset: () => void;
}

export function Step4Download({ year, month, entries, mood, template, onBack, onReset }: Step4Props) {
  const posterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setScale(Math.min(w / 600, 0.75));
      }
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
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
    <div className="flex-1 flex flex-col px-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <p className="text-[10px] tracking-[0.3em] text-muted-foreground font-body uppercase mb-2 self-start">Step 4</p>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-6 self-start">
          포스터 완성!
        </h2>

        <div ref={containerRef} className="w-full flex justify-center">
          <div className="origin-top shadow-2xl" style={{ width: 600, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
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

      <div className="py-6 max-w-md mx-auto w-full space-y-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background text-xs font-body tracking-[0.15em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading ? 'EXPORTING...' : 'DOWNLOAD IMAGE'}
        </button>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-border text-xs font-body tracking-[0.15em] uppercase hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-3 border border-border text-xs font-body tracking-[0.15em] uppercase hover:bg-secondary transition-colors"
          >
            처음부터 다시
          </button>
        </div>
      </div>
    </div>
  );
}
