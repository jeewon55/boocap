import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/contexts/LocaleContext';
import { createFlowMessages } from '@/i18n/createFlow';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
  /** Minimal bar — tap month/year to open picker; large month title may live in `compactLeading`. */
  compactHeader?: boolean;
  /** With `compactHeader`: [leading][year]; tap opens month picker. */
  compactLeading?: ReactNode;
  /** Controlled month-picker visibility. When set, use `onPickerOpenChange` to update it. */
  pickerOpen?: boolean;
  onPickerOpenChange?: (open: boolean) => void;
  /** If provided and returns `false`, the picker does not open (e.g. parent shows a confirm dialog first). */
  onRequestOpen?: () => boolean;
}

export function MonthSelector({
  year,
  month,
  onChange,
  compactHeader = false,
  compactLeading,
  pickerOpen: pickerOpenProp,
  onPickerOpenChange,
  onRequestOpen,
}: MonthSelectorProps) {
  const { locale } = useLocale();
  const flow = createFlowMessages[locale];
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const controlled = pickerOpenProp !== undefined;
  const open = controlled ? pickerOpenProp : uncontrolledOpen;

  const setPickerOpen = (next: boolean) => {
    if (!controlled) setUncontrolledOpen(next);
    onPickerOpenChange?.(next);
  };

  const [pickerYear, setPickerYear] = useState(year);

  useEffect(() => {
    if (open) setPickerYear(year);
  }, [open, year]);

  const handleSelect = (m: number) => {
    if (pickerYear === year && m === month) {
      setPickerOpen(false);
      return;
    }
    onChange(pickerYear, m);
    setPickerOpen(false);
  };

  const openPicker = () => {
    if (onRequestOpen && !onRequestOpen()) return;
    setPickerYear(year);
    setPickerOpen(true);
  };

  const yearTracking = 'tracking-[-2px]';

  return (
    <>
      {compactHeader ? (
        compactLeading != null ? (
          <div className="mb-2 px-2 pt-2 pb-1">
            <button
              type="button"
              onClick={openPicker}
              className="flex w-full min-w-0 cursor-pointer items-start justify-start gap-2 rounded-[4px] bg-transparent p-1 text-left transition-colors hover:bg-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/20"
            >
              <div className="min-w-0 w-fit text-left">{compactLeading}</div>
              <span
                className="font-['Helvetica_Neue'] shrink-0 self-end pb-[2px] text-[44px] font-bold tabular-nums leading-none tracking-normal text-foreground"
              >
                , {year}
              </span>
            </button>
          </div>
        ) : (
          <div className="py-2">
            <button
              type="button"
              onClick={openPicker}
              className={`font-display cursor-pointer rounded-[4px] bg-transparent p-1 text-left text-[20px] font-semibold tabular-nums leading-none ${yearTracking} text-foreground transition-colors hover:bg-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/20`}
            >
              {year}
            </button>
          </div>
        )
      ) : (
        <div className="border-b border-border py-4">
          <button
            type="button"
            onClick={openPicker}
            className="flex w-full min-w-0 cursor-pointer items-start justify-between gap-3 rounded-[4px] bg-transparent p-1 text-left transition-colors hover:bg-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/20"
          >
            <h3 className="min-w-0 flex-1 text-left font-display text-3xl font-bold tracking-[0] text-foreground md:text-4xl">
              {MONTHS[month]}
            </h3>
            <p className={`font-display shrink-0 self-start text-[20px] font-semibold tabular-nums leading-none ${yearTracking} text-muted-foreground`}>
              {year}
            </p>
          </button>
        </div>
      )}

      {/* Month picker modal */}
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20"
            onClick={() => setPickerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mx-4 w-[90vw] max-w-sm overflow-hidden rounded-[4px] border border-foreground/20 bg-card font-body shadow-[10px_10px_0_0_rgba(0,0,0,0.06)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with year navigation */}
              <div className="flex items-center justify-between border-b border-border/50 p-4">
                <button
                  onClick={() => setPickerYear((y) => y - 1)}
                  className="rounded-[4px] px-2 py-1 text-xs font-body text-muted-foreground transition-colors hover:text-foreground"
                >
                  {pickerYear - 1}
                </button>
                <span className={`font-display text-[20px] font-bold ${yearTracking} text-foreground tabular-nums`}>
                  {pickerYear}
                </span>
                <button
                  onClick={() => setPickerYear((y) => y + 1)}
                  className="rounded-[4px] px-2 py-1 text-xs font-body text-muted-foreground transition-colors hover:text-foreground"
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
                      className={`rounded-[4px] py-3 text-xs font-body font-medium tracking-normal transition-colors ${
                        isActive
                          ? 'bg-foreground text-background font-bold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="w-full rounded-[4px] border border-border py-3 text-xs font-body tracking-normal transition-colors hover:bg-muted"
                >
                  {flow.cancelLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
