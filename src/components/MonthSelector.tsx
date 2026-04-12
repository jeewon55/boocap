import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);

  const handleSelect = (m: number) => {
    onChange(pickerYear, m);
    setOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 py-4 border-b border-border">
        <div className="flex-1">
          <h3 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {MONTHS[month]}
          </h3>
          <p className="font-display text-sm tracking-[0.28em] text-muted-foreground mt-0.5 tabular-nums">
            {year}
          </p>
        </div>
        <button
          onClick={() => { setPickerYear(year); setOpen(true); }}
          className="text-[11px] font-body tracking-[0.1em] text-muted-foreground underline underline-offset-4 decoration-muted-foreground/40 hover:text-foreground hover:decoration-foreground transition-colors whitespace-normal"
        >
          Change Month
        </button>
      </div>

      {/* Month picker modal */}
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-foreground w-[90vw] max-w-sm mx-4 overflow-hidden shadow-[10px_10px_0_0_rgba(0,0,0,0.06)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with year navigation */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <button
                  onClick={() => setPickerYear((y) => y - 1)}
                  className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                >
                  {pickerYear - 1}
                </button>
                <span className="font-display text-lg font-bold tracking-tight text-foreground tabular-nums">
                  {pickerYear}
                </span>
                <button
                  onClick={() => setPickerYear((y) => y + 1)}
                  className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                >
                  {pickerYear + 1}
                </button>
              </div>

              {/* Month grid */}
              <div className="grid grid-cols-3 gap-2 p-4">
                {MONTHS.map((name, i) => {
                  const isActive = pickerYear === year && i === month;
                  return (
                    <button
                      key={name}
                      onClick={() => handleSelect(i)}
                      className={`py-3 text-xs font-body font-medium tracking-[0.12em] uppercase transition-colors ${
                        isActive
                          ? 'bg-foreground text-background font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {name.slice(0, 3)}
                    </button>
                  );
                })}
              </div>

              {/* Close */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-3 border border-border text-xs font-body tracking-[0.15em] uppercase hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
