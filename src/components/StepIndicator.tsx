const STEPS = ['Month & Mood', 'Add Books', 'Template', 'Download'];

interface StepIndicatorProps {
  current: number;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 px-6 py-4">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5 flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`h-1 w-full rounded-full transition-colors duration-300 ${
                i <= current ? 'bg-foreground' : 'bg-border'
              }`}
            />
            <span
              className={`text-[9px] tracking-[0.1em] font-body mt-1.5 transition-colors ${
                i <= current ? 'text-foreground' : 'text-muted-foreground'
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
