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
          <h3
            className="font-display text-3xl md:text-4xl font-black tracking-tight"
            style={{ color: '#DFFF00' }}
          >
            {MONTHS[month]}
          </h3>
          <p className="font-display text-sm tracking-[0.3em] text-muted-foreground mt-0.5">
            {year}
          </p>
        </div>
        <button
          onClick={() => { setPickerYear(year); setOpen(true); }}
          className="text-[11px] font-body tracking-[0.1em] text-muted-foreground underline underline-offset-4 decoration-muted-foreground/40 hover:text-primary hover:decoration-primary transition-colors whitespace-nowrap"
        >
          Change Month
        </button>
      </div>

      {/* Month picker modal */}
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border rounded-xl w-[90vw] max-w-sm mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with year navigation */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <button
                  onClick={() => setPickerYear((y) => y - 1)}
                  className="text-xs font-body text-muted-foreground hover:text-primary transition-colors px-2 py-1"
                >
                  {pickerYear - 1}
                </button>
                <span className="font-display text-lg font-bold tracking-tight text-primary">
                  {pickerYear}
                </span>
                <button
                  onClick={() => setPickerYear((y) => y + 1)}
                  className="text-xs font-body text-muted-foreground hover:text-primary transition-colors px-2 py-1"
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
                      className={`py-3 rounded-lg text-xs font-body font-medium tracking-[0.1em] transition-all ${
                        isActive
                          ? 'font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                      style={isActive ? { backgroundColor: '#DFFF00', color: '#000' } : undefined}
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
                  className="w-full py-3 border border-border text-xs font-body tracking-[0.15em] uppercase hover:bg-secondary transition-colors rounded-lg"
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
