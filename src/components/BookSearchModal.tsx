import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { searchBooks } from '@/lib/bookApi';
import { Book } from '@/types/book';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background border border-border w-full sm:max-w-md sm:mx-4 max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-lg animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-display text-sm tracking-[0.2em] text-muted-foreground">
            {MONTHS[month]} {day}
          </span>
          <button onClick={onClose} className="p-1 hover:bg-secondary transition-colors rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 p-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="책 제목을 검색하세요..."
            className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />}
        </div>

        <div className="overflow-y-auto flex-1">
          {results.map((book) => (
            <button
              key={book.key}
              onClick={() => onSelect(book)}
              className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors text-left border-b border-border last:border-0"
            >
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-10 h-14 object-cover flex-shrink-0 shadow-sm"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{book.title}</p>
                <p className="text-xs text-muted-foreground truncate">{book.author}</p>
              </div>
            </button>
          ))}
          {query && !loading && results.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground text-center">검색 결과가 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
