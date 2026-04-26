import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, ArrowLeft } from 'lucide-react';
import { Book, MoodType, TemplateType } from '@/types/book';
import { coverUrlForRasterExport } from '@/lib/coverExportUrl';
import { PosterCanvas } from './PosterCanvas';
import { motion } from 'framer-motion';
import { useLocale } from '@/contexts/LocaleContext';
import { createFlowMessages } from '@/i18n/createFlow';
import { toast } from '@/hooks/use-toast';

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
  const [feedbackState, setFeedbackState] = useState<'hidden' | 'shown' | 'submitted'>('hidden');
  const [feedbackRating, setFeedbackRating] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [hasShownFeedback, setHasShownFeedback] = useState(false);

  useEffect(() => {
    setHasShownFeedback(false);
  }, [template]);

  const handleFeedbackSubmit = async () => {
    if (!feedbackRating) return;
    setFeedbackState('submitted');
    try {
      await fetch('https://script.google.com/macros/s/AKfycbynXsxZMXeKOpVkGlYAt42apE2IEpdbabsfQxXA6Rvbub1-qHwRdoeLy-A1J6MsN0z9/exec', {
        method: 'POST',
        body: JSON.stringify({ rating: feedbackRating, comment: feedbackComment, template, month, year }),
      });
    } catch {
      // silent fail
    }
  };

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
    const swapBackImg: { el: HTMLImageElement; prev: string }[] = [];
    const swapBackBg: { el: HTMLElement; prev: string }[] = [];
    let prevBorder = '';

    async function fetchAsDataUrl(url: string): Promise<string | null> {
      try {
        const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch { return null; }
    }

    function extractBgUrl(bgValue: string): string | null {
      let m = bgValue.match(/url\("([^"]+)"\)/);
      if (m) return m[1];
      m = bgValue.match(/url\('([^']+)'\)/);
      if (m) return m[1];
      m = bgValue.match(/url\(([^)]+)\)/);
      if (m) return m[1].trim();
      return null;
    }

    try {
      const TARGET_W = 1080;
      const root = posterRef.current;

      // 1. Swap <img> elements (paper texture, etc.)
      const imgs = Array.from(root.querySelectorAll('img'));
      await Promise.all(imgs.map(async (img) => {
        const prev = img.src;
        if (!prev || prev.startsWith('data:') || prev.startsWith('blob:')) return;
        const proxyUrl = coverUrlForRasterExport(prev);
        const dataUrl = await fetchAsDataUrl(proxyUrl);
        if (dataUrl) {
          swapBackImg.push({ el: img, prev });
          img.src = dataUrl;
          try { await img.decode(); } catch { /* ignore */ }
        }
      }));

      // 2. Swap background-image divs (book covers rendered as CSS background)
      const coverEls = Array.from(root.querySelectorAll<HTMLElement>('[role="img"]'));
      await Promise.all(coverEls.map(async (el) => {
        const currentBg = el.style.backgroundImage;
        if (!currentBg || currentBg === 'none') return;
        const url = extractBgUrl(currentBg);
        if (!url || url.startsWith('data:') || url.startsWith('blob:')) return;
        const proxyUrl = coverUrlForRasterExport(url);
        const dataUrl = await fetchAsDataUrl(proxyUrl);
        if (dataUrl) {
          swapBackBg.push({ el, prev: currentBg });
          el.style.backgroundImage = `url("${dataUrl}")`;
        }
      }));

      // Three frames — give Safari time to flush decoded images to compositor
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });

      // Remove outer frame border for export (preview-only decoration)
      prevBorder = root.style.border;
      root.style.border = 'none';

      const exportOptions = {
        // Re-fetching every asset with a new query string makes export much slower.
        cacheBust: false,
        includeQueryParams: true,
        pixelRatio: 1,
        canvasWidth: TARGET_W,
        canvasHeight: 1350,
        // Embedding all @font-face files (Google Fonts, Pretendard, …) is usually the slowest step;
        // fonts are already loaded for on-screen poster — skip duplicate downloads.
        skipFonts: true,
        backgroundColor: null,
      } as const;

      const dataUrl = await toPng(root, exportOptions);

      const link = document.createElement('a');
      link.download = `book-recap-${MONTHS[month].toLowerCase()}-${year}.png`;
      link.href = dataUrl;
      link.click();
      if (!hasShownFeedback) {
        setFeedbackState('shown');
        setHasShownFeedback(true);
      }
    } catch (e) {
      console.error('Export failed', e);
      toast({ title: flow.downloadFailedToast });
    } finally {
      for (const { el, prev } of swapBackImg) el.src = prev;
      for (const { el, prev } of swapBackBg) el.style.backgroundImage = prev;
      if (posterRef.current) posterRef.current.style.border = prevBorder ?? '';
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

      {feedbackState === 'shown' && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-foreground/40 px-6">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-sm rounded-[4px] border border-foreground/20 bg-card p-6 font-body shadow-[10px_10px_0_0_rgba(0,0,0,0.06)]"
          >
            <p className="font-display text-[18px] font-bold tracking-[0] text-foreground">
              {flow.feedbackQuestion}
            </p>
            <div className="mt-5 flex justify-around">
              {(['😍', '😊', '😐'] as const).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFeedbackRating(emoji)}
                  className={`flex flex-col items-center gap-1 rounded-[4px] px-5 py-3 text-3xl transition-all ${feedbackRating === emoji ? 'bg-secondary scale-110' : 'hover:bg-secondary'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder={flow.feedbackPlaceholder}
              rows={3}
              className="mt-4 w-full resize-none rounded-[4px] border border-border bg-transparent px-3 py-2.5 text-sm font-body outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setFeedbackState('hidden')}
                className="flex-1 rounded-[4px] border border-border py-3 text-xs font-semibold tracking-normal transition-colors hover:bg-secondary"
              >
                {flow.cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleFeedbackSubmit}
                disabled={!feedbackRating}
                className="flex-1 rounded-[4px] bg-primary py-3 text-xs font-semibold tracking-normal text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
              >
                {locale === 'ko' ? '보내기' : 'Submit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {feedbackState === 'submitted' && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-foreground/40 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-sm rounded-[4px] border border-foreground/20 bg-card p-6 font-body shadow-[10px_10px_0_0_rgba(0,0,0,0.06)]"
          >
            <p className="text-center font-display text-[18px] font-bold tracking-[0] text-foreground">
              {flow.feedbackThanks}
            </p>
            <button
              type="button"
              onClick={() => setFeedbackState('hidden')}
              className="mt-5 w-full rounded-[4px] bg-primary py-3 text-xs font-semibold tracking-normal text-primary-foreground transition-opacity hover:opacity-90"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
