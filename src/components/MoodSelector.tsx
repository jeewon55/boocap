import { MOODS, MoodType } from '@/types/book';

interface MoodSelectorProps {
  selected: MoodType;
  onChange: (mood: MoodType) => void;
}

export function MoodSelector({ selected, onChange }: MoodSelectorProps) {
  return (
    <div className="py-4 border-t border-border">
      <p className="text-[10px] tracking-[0.3em] text-muted-foreground mb-3 font-body uppercase">Mood</p>
      <div className="flex gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onChange(mood.id)}
            className={`flex-1 py-2 text-xs font-body tracking-wide border transition-colors ${
              selected === mood.id
                ? 'border-foreground bg-foreground text-background'
                : 'border-border hover:border-foreground/30'
            }`}
          >
            {mood.label}
          </button>
        ))}
      </div>
    </div>
  );
}
