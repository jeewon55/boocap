import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDefaultMonth() {
  const now = new Date();
  let m = now.getMonth() - 1;
  let y = now.getFullYear();
  if (m < 0) {
    m = 11;
    y -= 1;
  }
  return { year: y, month: m };
}

export default function Landing() {
  const navigate = useNavigate();
  const { year: defYear, month: defMonth } = getDefaultMonth();
  const [year, setYear] = useState(defYear);
  const [month, setMonth] = useState(defMonth);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    const onPointerDown = (e: PointerEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showPicker]);

  const handleCreate = () => {
    navigate(`/create?year=${year}&month=${month}`);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-border">
        <span className="font-display text-sm font-bold tracking-[0.28em] uppercase">
          Boocap
        </span>
        <button
          type="button"
          onClick={handleCreate}
          className="text-[10px] font-body text-muted-foreground hover:text-foreground tracking-[0.22em] uppercase transition-colors"
        >
          Get started
        </button>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full">
        <section className="flex-1 flex flex-col justify-center px-6 md:px-10 py-14 lg:py-24">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.12] tracking-[-0.03em] text-foreground max-w-xl">
            Visualize your{' '}
            <span className="text-accent">intellectual growth</span>
            <br />
            in one precise poster.
          </h1>
          <p className="mt-0 h-fit w-fit max-w-md text-left text-sm md:text-base font-body text-muted-foreground leading-relaxed">
            Turn monthly readings into a clean, grid-based summary. Track, lay out, and export in a single composition.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:items-stretch">
            <div ref={pickerRef} className="relative">
              <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="h-12 w-full sm:w-auto min-w-[200px] px-4 bg-card border border-border text-foreground font-body text-xs tracking-wide flex items-center gap-3 hover:bg-muted/60 transition-colors text-left uppercase"
              >
                <BookOpen className="w-4 h-4 text-foreground shrink-0" strokeWidth={1.5} />
                <span className="normal-case tracking-normal">{MONTHS[month]} {year}</span>
              </button>

              {showPicker && (
                <div className="absolute top-full left-0 mt-2 bg-card border border-border p-4 min-w-[280px] shadow-[8px_8px_0_0_rgba(0,0,0,0.06)]">
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {years.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setYear(y)}
                        className={`px-2.5 py-1.5 text-[10px] font-body tracking-wider uppercase border transition-colors ${
                          y === year
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-border">
                    {MONTHS.map((m, i) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMonth(i);
                          setShowPicker(false);
                        }}
                        className={`py-2.5 text-[10px] font-body tracking-[0.12em] uppercase bg-card transition-colors ${
                          i === month
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {m.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="h-12 px-8 bg-foreground text-background font-display text-[11px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Create recap
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </section>

        <aside className="flex-1 flex items-center justify-center px-6 md:px-10 py-12 lg:py-24 bg-background border-t lg:border-t-0 border-border">
          <div className="w-full max-w-[300px] md:max-w-[320px]">
            <div className="border border-foreground bg-card aspect-[4/5] flex flex-col p-6 shadow-[12px_12px_0_0_rgba(0,0,0,0.08)]">
              <div>
                <p className="text-accent text-[9px] font-body tracking-[0.35em] uppercase font-semibold">
                  Monthly recap
                </p>
                <p className="font-display text-2xl font-bold tracking-tight mt-2 text-foreground">
                  {MONTHS[month]}
                </p>
                <p className="text-muted-foreground text-[11px] font-body tabular-nums mt-0.5">{year}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 my-6 flex-1 content-center">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] border border-border bg-muted"
                    style={{
                      backgroundImage: `linear-gradient(135deg, hsl(0 0% ${88 - i * 3}%) 0%, hsl(0 0% ${78 - i * 4}%) 100%)`,
                    }}
                  />
                ))}
              </div>

              <div className="flex justify-between items-end pt-2 border-t border-border">
                <div>
                  <p className="font-display text-3xl font-bold tabular-nums leading-none">6</p>
                  <p className="text-muted-foreground text-[9px] font-body tracking-[0.2em] uppercase mt-1">Books</p>
                </div>
                <div className="flex gap-0.5 items-end h-12">
                  {[20, 45, 30, 60, 50, 35].map((h, i) => (
                    <div key={i} className="w-1.5 bg-foreground/25" style={{ height: `${h * 0.45}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
}
