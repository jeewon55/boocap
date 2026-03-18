import { Book, MoodType, TemplateType, TEMPLATES, MOODS } from '@/types/book';
import { ArrowLeft } from 'lucide-react';
import { PosterCanvas } from './PosterCanvas';
import { useRef, useState, useEffect } from 'react';

interface Step3Props {
  year: number;
  month: number;
  entries: Record<number, Book>;
  mood: MoodType;
  template: TemplateType;
  onTemplateChange: (t: TemplateType) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export function Step3Template({ year, month, entries, mood, template, onTemplateChange, onBack, onGenerate }: Step3Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setScale(Math.min(w / 600, 0.55));
      }
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="flex-1 flex flex-col px-6">
      <div className="flex-1 max-w-md mx-auto w-full pt-2">
        <p className="text-[10px] tracking-[0.3em] text-muted-foreground font-body uppercase mb-2">Step 3</p>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-6">
          템플릿을 선택하세요
        </h2>

        {/* Template options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t.id)}
              className={`p-4 border text-left transition-all ${
                template === t.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground/30'
              }`}
            >
              <p className="text-sm font-display font-semibold">{t.label}</p>
              <p className={`text-[10px] mt-0.5 ${template === t.id ? 'opacity-70' : 'text-muted-foreground'}`}>
                {t.description}
              </p>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div ref={containerRef} className="w-full flex justify-center">
          <div className="origin-top shadow-xl" style={{ width: 600, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
            <PosterCanvas
              year={year}
              month={month}
              entries={entries}
              mood={mood}
              template={template}
            />
          </div>
        </div>
      </div>

      <div className="py-6 max-w-md mx-auto w-full flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 py-4 border border-border text-xs font-body tracking-[0.15em] uppercase hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <button
          onClick={onGenerate}
          className="flex-[2] flex items-center justify-center gap-2 py-4 bg-foreground text-background text-xs font-body tracking-[0.15em] uppercase hover:opacity-90 transition-opacity"
        >
          Generate Poster
        </button>
      </div>
    </div>
  );
}
