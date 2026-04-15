import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2, PenLine, Upload, BookOpen } from 'lucide-react';
import { enrichBookWithPageCount, searchBooks } from '@/lib/bookApi';
import { Book } from '@/types/book';
import { motion } from 'framer-motion';

function BookCoverThumb({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className="w-10 h-[60px] flex-shrink-0 rounded overflow-hidden bg-secondary relative">
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-secondary" />
      )}
      {status === 'error' ? (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-200 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface BookSearchModalProps {
  day: number;
  month: number;
  onSelect: (book: Book) => void;
  onClose: () => void;
}

export function BookSearchModal({ day, month, onSelect, onClose }: BookSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrichingKey, setEnrichingKey] = useState<string | null>(null);
  const [mode, setMode] = useState<'search' | 'manual'>('search');

  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualCoverUrl, setManualCoverUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setManualCoverUrl(reader.result as string);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const books = await searchBooks(q);
      setResults(books);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (mode !== 'search') return;
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, search, mode]);

  const handleManualConfirm = () => {
    if (!manualTitle.trim()) return;
    onSelect({
      title: manualTitle.trim(),
      author: manualAuthor.trim() || '',
      coverUrl: manualCoverUrl.trim() || '/placeholder.svg',
      key: `manual-${day}-${Date.now()}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/15" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[4px] border border-foreground/20 bg-card font-body sm:mx-4 sm:max-w-md sm:rounded-[4px] sm:shadow-[10px_10px_0_0_rgba(0,0,0,0.06)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <span className="font-display text-[20px] font-extrabold tracking-[0] text-[#121212]">
            {MONTH_NAMES[month]} {day}
          </span>
          <button onClick={onClose} className="rounded-[4px] p-1 transition-colors hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setMode('search')}
            className={`flex-1 rounded-none py-2.5 text-xs font-body font-medium tracking-normal transition-colors ${
              mode === 'search' ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 rounded-none py-2.5 text-xs font-body font-medium tracking-normal transition-colors ${
              mode === 'manual' ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground'
            }`}
          >
            Manual entry
          </button>
        </div>

        {mode === 'search' ? (
          <>
            <div className="flex items-center gap-2 p-4 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or author…"
                className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
              />
              {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />}
            </div>

            <div className="overflow-y-auto flex-1">
              {results.map((book) => (
                <button
                  key={book.key}
                  type="button"
                  disabled={enrichingKey != null}
                  onClick={async () => {
                    setEnrichingKey(book.key);
                    try {
                      onSelect(await enrichBookWithPageCount(book));
                    } finally {
                      setEnrichingKey(null);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors text-left border-b border-border last:border-0 disabled:opacity-50"
                >
                  <BookCoverThumb src={book.coverUrl} alt={book.title} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium font-body text-foreground">{book.title}</p>
                    <p className="truncate text-xs font-body text-muted-foreground">{book.author}</p>
                  </div>
                  {enrichingKey === book.key ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
                  ) : null}
                </button>
              ))}

              {query && !loading && results.length === 0 && (
                <div className="p-4 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">No results found.</p>
                  <button
                    onClick={() => { setMode('manual'); setManualTitle(query); }}
                    className="inline-flex items-center gap-1.5 text-xs font-body text-foreground underline underline-offset-2 transition-opacity hover:opacity-70"
                  >
                    <PenLine className="w-3 h-3" />
                    Enter manually
                  </button>
                </div>
              )}

              {(!query || results.length > 0) && (
                <button
                  onClick={() => setMode('manual')}
                  className="w-full flex items-center gap-2 p-3 text-muted-foreground hover:bg-secondary transition-colors text-left"
                >
                  <PenLine className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-body">Can&apos;t find your book? Enter manually</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            <div className="flex flex-col items-center gap-3">
              {manualCoverUrl && !previewError ? (
                <div className="relative group">
                  <img
                    src={manualCoverUrl}
                    alt="Book cover"
                    className="w-24 h-36 object-cover shadow-lg rounded"
                    onError={() => setPreviewError(true)}
                  />
                  <button
                    type="button"
                    onClick={() => { setManualCoverUrl(''); setPreviewError(false); }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-36 w-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[4px] border border-dashed border-border bg-secondary transition-colors hover:border-primary"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[9px] font-body text-muted-foreground">Upload</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              {!manualCoverUrl && (
                <p className="text-[10px] font-body text-muted-foreground">Upload a cover image or paste a URL below.</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-body tracking-[0.2em] text-muted-foreground">Title *</label>
              <input
                autoFocus={mode === 'manual'}
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Demian"
                className="w-full rounded border border-border bg-transparent px-3 py-2.5 text-sm font-body outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-body tracking-[0.2em] text-muted-foreground">Author</label>
              <input
                value={manualAuthor}
                onChange={(e) => setManualAuthor(e.target.value)}
                placeholder="e.g. Hermann Hesse"
                className="w-full rounded border border-border bg-transparent px-3 py-2.5 text-sm font-body outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {!manualCoverUrl && (
              <div>
                <label className="mb-2 block text-[10px] font-body tracking-[0.2em] text-muted-foreground">Or cover image URL</label>
                <input
                  value={manualCoverUrl}
                  onChange={(e) => { setManualCoverUrl(e.target.value); setPreviewError(false); }}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full rounded border border-border bg-transparent px-3 py-2.5 text-sm font-body outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            )}

            <button
              onClick={handleManualConfirm}
              disabled={!manualTitle.trim()}
              className="w-full rounded-[4px] bg-primary py-3 text-xs font-body font-semibold tracking-normal text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              Save
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
