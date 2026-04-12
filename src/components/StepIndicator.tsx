const STEPS = ['Add Books', 'Template', 'Download'];

interface StepIndicatorProps {
  current: number;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 px-6 py-4 border-b border-border bg-background">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5 flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`h-0.5 w-full transition-colors duration-300 ${
                i <= current ? 'bg-foreground' : 'bg-border'
              }`}
            />
            <span
              className={`text-[9px] tracking-[0.18em] font-body uppercase mt-2 transition-colors ${
                i <= current ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
