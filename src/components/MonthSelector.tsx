import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const prev = () => {
    if (month === 0) onChange(year - 1, 11);
    else onChange(year, month - 1);
  };
  const next = () => {
    if (month === 11) onChange(year + 1, 0);
    else onChange(year, month + 1);
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-border">
      <button onClick={prev} className="p-2 hover:bg-secondary transition-colors rounded-lg">
        <ChevronLeft className="w-4 h-4 text-foreground" />
      </button>
      <div className="text-center">
        <p className="font-display text-2xl font-bold tracking-tight text-primary">{MONTHS[month]}</p>
        <p className="font-display text-sm tracking-[0.3em] text-muted-foreground">{year}</p>
      </div>
      <button onClick={next} className="p-2 hover:bg-secondary transition-colors rounded-lg">
        <ChevronRight className="w-4 h-4 text-foreground" />
      </button>
    </div>
  );
}
