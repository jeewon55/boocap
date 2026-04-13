import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { enrichBookWithPageCount, searchBooks } from '@/lib/bookApi';
import { Book } from '@/types/book';

interface BookSearchProps {
  day: number;
  month: string;
  onSelect: (book: Book) => void;
  onClose: () => void;
}

export function BookSearch({ day, month, onSelect, onClose }: BookSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrichingKey, setEnrichingKey] = useState<string | null>(null);

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
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background border border-border w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-display text-sm tracking-[0.2em] text-muted-foreground">
            {month} {day}
          </span>
          <button onClick={onClose} className="p-1 hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 p-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a book..."
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
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-10 h-14 object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{book.title}</p>
                <p className="text-xs text-muted-foreground truncate">{book.author}</p>
              </div>
              {enrichingKey === book.key ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
              ) : null}
            </button>
          ))}
          {query && !loading && results.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground text-center">No results found</p>
          )}
        </div>
      </div>
    </div>
  );
}
