import { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import { MonthSelector } from '@/components/MonthSelector';
import { BookCalendar } from '@/components/BookCalendar';
import { BookSearch } from '@/components/BookSearch';
import { MoodSelector } from '@/components/MoodSelector';
import { PosterCanvas } from '@/components/PosterCanvas';
import { Book, MoodType } from '@/types/book';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const now = new Date();

export default function Index() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [entries, setEntries] = useState<Record<number, Book>>({});
  const [mood, setMood] = useState<MoodType>('minimal');
  const [searchDay, setSearchDay] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(1);
  const posterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setScale(Math.min(w / 600, 1));
      }
    };
    updateScale();
    const obs = new ResizeObserver(updateScale);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const handleMonthChange = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setEntries({});
  }, []);

  const handleSelectBook = useCallback((book: Book) => {
    if (searchDay === null) return;
    setEntries((prev) => ({ ...prev, [searchDay]: book }));
    setSearchDay(null);
  }, [searchDay]);

  const handleRemove = useCallback((day: number) => {
    setEntries((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  }, []);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.download = `book-recap-${MONTHS[month].toLowerCase()}-${year}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    }
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-screen">
        {/* Left: Controls */}
        <div className="w-full lg:w-[380px] lg:border-r border-border p-6 lg:p-8 flex-shrink-0 overflow-y-auto">
          <h1 className="font-display text-lg font-bold tracking-tight mb-1">Book Recap</h1>
          <p className="text-xs text-muted-foreground font-body mb-6">Your monthly reading, visualized.</p>

          <MonthSelector year={year} month={month} onChange={handleMonthChange} />
          <BookCalendar
            year={year}
            month={month}
            entries={entries}
            onDayClick={setSearchDay}
            onRemove={handleRemove}
          />
          <MoodSelector selected={mood} onChange={setMood} />

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background text-xs font-body tracking-[0.15em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'EXPORTING...' : 'DOWNLOAD IMAGE'}
          </button>
        </div>

        {/* Right: Poster Preview */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-secondary/30">
          <div ref={containerRef} className="w-full max-w-[600px]">
            <div className="shadow-2xl origin-top-left" style={{ width: 600, transform: `scale(${scale})` }}>
              <PosterCanvas
                ref={posterRef}
                year={year}
                month={month}
                entries={entries}
                mood={mood}
              />
            </div>
          </div>
        </div>
      </div>

      {searchDay !== null && (
        <BookSearch
          day={searchDay}
          month={MONTHS[month]}
          onSelect={handleSelectBook}
          onClose={() => setSearchDay(null)}
        />
      )}
    </div>
  );
}
