import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PosterCanvas } from '@/components/PosterCanvas';
import {
  Book,
  MoodType,
  MOODS,
  TEMPLATES,
  TemplateType,
  isTemplateVisibleForBookCount,
} from '@/types/book';
import { cn } from '@/lib/utils';

const QA_YEAR = 2026;
/** January — 31 days so 1–12 books always fit on distinct days. */
const QA_MONTH = 0;

const BOOK_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/** Scaled poster in table cells — larger for QA; table scrolls as needed. */
const CELL_SCALE = 0.22;

function makeFakeEntries(bookCount: number): Record<number, Book> {
  const entries: Record<number, Book> = {};
  for (let day = 1; day <= bookCount; day++) {
    entries[day] = {
      key: `qa-${QA_YEAR}-${QA_MONTH + 1}-${day}`,
      title: `Sample title ${day}`,
      author: 'Author',
      coverUrl: `https://picsum.photos/seed/boocap-qa-${day}-${bookCount}/120/174`,
    };
  }
  return entries;
}

function ScaledPoster({
  year,
  month,
  entries,
  mood,
  template,
  scale,
}: {
  year: number;
  month: number;
  entries: Record<number, Book>;
  mood: MoodType;
  template: TemplateType;
  scale: number;
}) {
  const w = 600 * scale;
  const h = 750 * scale;
  return (
    <div className="mx-auto overflow-hidden rounded border border-border/80 bg-muted/15" style={{ width: w, height: h }}>
      <div style={{ width: 600, height: 750, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <PosterCanvas year={year} month={month} entries={entries} mood={mood} template={template} />
      </div>
    </div>
  );
}

/**
 * Temporary QA board: table — rows = templates, columns = book count 1–12.
 * Route: `/create/qa-posters`
 */
export default function PosterTemplateQa() {
  const [mood, setMood] = useState<MoodType>('minimal');
  const moodLabel = useMemo(() => MOODS.find((m) => m.id === mood)?.label ?? mood, [mood]);

  const entriesByCount = useMemo(() => {
    const m: Record<number, Record<number, Book>> = {};
    for (const n of BOOK_COUNTS) {
      m[n] = makeFakeEntries(n);
    }
    return m;
  }, []);

  const thBase =
    'border border-border bg-background px-2 py-2 text-left font-body text-xs font-semibold text-foreground';
  const tdBase = 'border border-border align-top p-2';

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="border-b border-border px-4 py-6 md:px-8">
        <div className="mx-auto max-w-[160rem]">
          <p className="mb-1 font-body text-xs text-muted-foreground">Temporary QA</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Poster templates × book count</h1>
          <p className="mt-2 max-w-3xl font-body text-sm text-muted-foreground">
            Rows are templates, columns are how many books are in the month. Dimmed cells are hidden in the real
            picker for that count. Scroll horizontally and vertically as needed.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link to="/create" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              ← Back to create flow
            </Link>
            {import.meta.env.DEV ? (
              <a
                href="/create"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Create flow (new tab)
              </a>
            ) : null}
            <label className="flex items-center gap-2 font-body text-sm">
              <span className="text-muted-foreground">Mood</span>
              <select
                className="rounded-md border border-border bg-card px-2 py-1.5 text-sm"
                value={mood}
                onChange={(e) => setMood(e.target.value as MoodType)}
              >
                {MOODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <span className="text-xs text-muted-foreground">Current: {moodLabel}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[160rem] px-4 pb-16 pt-4 md:px-8">
        <div className="max-h-[calc(100dvh-14rem)] overflow-auto rounded-lg border border-border shadow-sm">
          <table className="w-max min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th
                  className={cn(
                    thBase,
                    'sticky left-0 top-0 z-30 min-w-[10.5rem] max-w-[12rem] bg-background shadow-[4px_0_12px_-4px_rgba(0,0,0,0.12)]',
                  )}
                >
                  Template
                </th>
                {BOOK_COUNTS.map((n) => (
                  <th
                    key={n}
                    className={cn(thBase, 'sticky top-0 z-20 min-w-[8.5rem] whitespace-nowrap bg-background text-center')}
                  >
                    {n}권
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEMPLATES.map((t) => (
                <tr key={t.id} className="bg-card/40">
                  <th
                    className={cn(
                      thBase,
                      'sticky left-0 z-10 min-w-[10.5rem] max-w-[12rem] bg-muted/90 align-middle font-display text-[11px] font-bold leading-snug tracking-tight shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)]',
                    )}
                  >
                    {t.label}
                  </th>
                  {BOOK_COUNTS.map((n) => {
                    const visible = isTemplateVisibleForBookCount(t.id, n);
                    return (
                      <td key={n} className={cn(tdBase, 'bg-background')}>
                        <div
                          className={cn(
                            'flex min-h-[11rem] flex-col items-center justify-start gap-1',
                            !visible && 'opacity-45',
                          )}
                        >
                          {!visible ? (
                            <span className="rounded bg-muted px-1 py-0.5 font-body text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                              Hidden
                            </span>
                          ) : (
                            <span className="h-5 shrink-0" aria-hidden />
                          )}
                          <ScaledPoster
                            year={QA_YEAR}
                            month={QA_MONTH}
                            entries={entriesByCount[n]}
                            mood={mood}
                            template={t.id}
                            scale={CELL_SCALE}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
