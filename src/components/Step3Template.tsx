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
    <div className="flex flex-1 flex-col px-6">
      <div className="mx-auto w-full max-w-[26rem] flex-1 pt-2">
        <div className="text-center">
          <p className="mb-2 font-display text-[10px] uppercase tracking-[0] text-muted-foreground">Step 3</p>
          <h2 className="mt-2 mb-6 font-display text-[20px] font-extrabold leading-none tracking-[0] text-[#d6d6d6]">
            템플릿을 선택하세요
          </h2>
        </div>

        {/* Template options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t.id)}
              className={`rounded-[4px] border p-4 text-left transition-all ${
                template === t.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground/30'
              }`}
            >
              <p className="text-sm font-display font-semibold tracking-[0]">{t.label}</p>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div ref={containerRef} className="w-full flex justify-center">
          <div className="origin-top" style={{ width: 600, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
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

      <div className="mx-auto flex w-full max-w-[26rem] gap-3 py-6">
        <button
          onClick={onBack}
          className="flex flex-1 items-center justify-center gap-2 rounded-[4px] border border-border py-4 text-xs font-body font-medium tracking-normal transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <button
          onClick={onGenerate}
          className="flex flex-[2] items-center justify-center gap-2 rounded-[4px] bg-foreground py-4 text-xs font-body font-medium tracking-normal text-background transition-opacity hover:opacity-90"
        >
          Generate Poster
        </button>
      </div>
    </div>
  );
}
