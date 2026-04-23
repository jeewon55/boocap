import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, ArrowLeft } from 'lucide-react';
import { Book, MoodType, TemplateType } from '@/types/book';
import { PosterCanvas } from './PosterCanvas';
import { motion } from 'framer-motion';
import { useLocale } from '@/contexts/LocaleContext';
import { createFlowMessages } from '@/i18n/createFlow';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

interface Step3Props {
  year: number;
  month: number;
  entries: Record<number, Book>;
  mood: MoodType;
  template: TemplateType;
  onBack: () => void;
  onReset: () => void;
}

export function Step3Download({ year, month, entries, mood, template, onBack, onReset }: Step3Props) {
  const { locale } = useLocale();
  const flow = createFlowMessages[locale];
  const posterRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [downloading, setDownloading] = useState(false);
  const [showStartOverModal, setShowStartOverModal] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 600);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const TARGET_W = 1080;
      const images = posterRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(async (img) => {
          if (!img.complete) {
            await new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            });
          }
          try {
            await img.decode();
          } catch {
            // Ignore decode failures; export can continue.
          }
        })
      );
      // Small extra delay for rendering stability
      await new Promise((r) => setTimeout(r, 300));

      const exportOptions = {
        cacheBust: true,
        includeQueryParams: true,
        pixelRatio: 1,
        canvasWidth: TARGET_W,
        canvasHeight: 1350,
        skipFonts: false,
        backgroundColor: null,
      } as const;

      const dataUrl = await toPng(posterRef.current, exportOptions);

      const link = document.createElement('a');
      link.download = `book-recap-${MONTHS[month].toLowerCase()}-${year}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setDownloading(false);
    }
  };

  const scaledW = 600 * scale;
  const scaledH = 750 * scale;

  return (
    <div className="flex flex-1 flex-col overflow-auto px-4 sm:px-6">
      <div className="mx-auto w-full max-w-[26rem] shrink-0 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center"
        >
          <h2 className="mt-2 mb-2 font-display text-[20px] font-extrabold leading-none tracking-[0] text-[#d6d6d6]">
            {flow.archiveVisualizedTitle}
          </h2>
        </motion.div>
      </div>

      <div className="mx-auto flex w-full max-w-[26rem] shrink-0 flex-col py-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex w-full shrink-0 flex-col items-center overflow-hidden px-1 pt-6 pb-1 md:px-2"
        >
          <div
            ref={wrapperRef}
            className="flex w-full justify-center overflow-hidden"
            style={{
              aspectRatio: '4/5',
              maxWidth: 420,
            }}
          >
            <div style={{ width: scaledW, height: scaledH, overflow: 'hidden', flexShrink: 0, borderRadius: 'inherit' }}>
              <div style={{ width: 600, height: 750, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <PosterCanvas
                  ref={posterRef}
                  year={year}
                  month={month}
                  entries={entries}
                  mood={mood}
                  template={template}
                  posterLocale={locale}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-[26rem] space-y-3 pt-2 pb-[max(1rem,calc(1rem+env(safe-area-inset-bottom,0px)))]">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-primary py-4 text-xs font-body font-semibold tracking-normal text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading ? flow.downloadExporting : flow.downloadImageCta}
        </button>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex flex-1 items-center justify-center gap-2 rounded-[4px] border border-border py-3 text-xs font-body font-medium tracking-normal transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {flow.templateStepBack}
          </button>
          <button
            type="button"
            onClick={() => setShowStartOverModal(true)}
            className="flex-1 rounded-[4px] border border-border py-3 text-xs font-body font-medium tracking-normal transition-colors hover:bg-secondary"
          >
            {flow.startOverCta}
          </button>
        </div>
      </div>

      {showStartOverModal ? (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-foreground/25 px-6"
          onClick={() => setShowStartOverModal(false)}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="start-over-modal-title"
            className="w-full max-w-sm rounded-[4px] border border-foreground/20 bg-card p-5 font-body shadow-[10px_10px_0_0_rgba(0,0,0,0.06)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              id="start-over-modal-title"
              className="font-display text-[18px] font-bold tracking-[0] text-foreground"
            >
              {flow.startOverModalTitle}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{flow.startOverModalBody}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowStartOverModal(false)}
                className="flex-1 rounded-[4px] border border-border py-3 text-xs font-semibold tracking-normal transition-colors hover:bg-secondary"
              >
                {flow.startOverModalCancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowStartOverModal(false);
                  onReset();
                }}
                className="flex-1 rounded-[4px] bg-primary py-3 text-xs font-semibold tracking-normal text-primary-foreground transition-opacity hover:opacity-90"
              >
                {flow.startOverModalConfirm}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
