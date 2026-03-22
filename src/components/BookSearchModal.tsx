import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2, PenLine, ImageIcon, Upload } from 'lucide-react';
import { useRef } from 'react';
import { searchBooks } from '@/lib/bookApi';
import { Book } from '@/types/book';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const PLACEHOLDER_COVERS = [
  '/placeholder.svg',
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
  const [mode, setMode] = useState<'search' | 'manual'>('search');

  // Manual entry state
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualCoverUrl, setManualCoverUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background border border-border w-full sm:max-w-md sm:mx-4 max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-lg animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-display text-sm tracking-[0.2em] text-muted-foreground">
            {MONTHS[month]} {day}
          </span>
          <button onClick={onClose} className="p-1 hover:bg-secondary transition-colors rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setMode('search')}
            className={`flex-1 py-2.5 text-xs font-body tracking-[0.1em] uppercase transition-colors ${
              mode === 'search' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground'
            }`}
          >
            검색
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-2.5 text-xs font-body tracking-[0.1em] uppercase transition-colors ${
              mode === 'manual' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground'
            }`}
          >
            직접 입력
          </button>
        </div>

        {mode === 'search' ? (
          <>
            {/* Search input */}
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

            {/* Results */}
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
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                  </div>
                </button>
              ))}

              {query && !loading && results.length === 0 && (
                <div className="p-4 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">검색 결과가 없습니다</p>
                  <button
                    onClick={() => {
                      setMode('manual');
                      setManualTitle(query);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-body text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    <PenLine className="w-3 h-3" />
                    직접 입력하기
                  </button>
                </div>
              )}

              {/* Always show manual entry shortcut at bottom */}
              {(!query || results.length > 0) && (
                <button
                  onClick={() => setMode('manual')}
                  className="w-full flex items-center gap-2 p-3 text-muted-foreground hover:bg-secondary transition-colors text-left"
                >
                  <PenLine className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-body">찾는 책이 없나요? 직접 입력하기</span>
                </button>
              )}
            </div>
          </>
        ) : (
          /* Manual entry form */
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            {/* Cover preview */}
            <div className="flex justify-center">
              {manualCoverUrl && !previewError ? (
                <img
                  src={manualCoverUrl}
                  alt="Book cover"
                  className="w-24 h-36 object-cover shadow-lg"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="w-24 h-36 bg-secondary flex items-center justify-center border border-border">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] tracking-[0.2em] text-muted-foreground font-body uppercase block mb-2">
                책 제목 *
              </label>
              <input
                autoFocus={mode === 'manual'}
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="예: 데미안"
                className="w-full bg-transparent border border-border px-3 py-2.5 text-sm font-body outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
              />
            </div>

            {/* Author */}
            <div>
              <label className="text-[10px] tracking-[0.2em] text-muted-foreground font-body uppercase block mb-2">
                저자
              </label>
              <input
                value={manualAuthor}
                onChange={(e) => setManualAuthor(e.target.value)}
                placeholder="예: 헤르만 헤세"
                className="w-full bg-transparent border border-border px-3 py-2.5 text-sm font-body outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
              />
            </div>

            {/* Cover URL */}
            <div>
              <label className="text-[10px] tracking-[0.2em] text-muted-foreground font-body uppercase block mb-2">
                표지 이미지 URL
              </label>
              <input
                value={manualCoverUrl}
                onChange={(e) => { setManualCoverUrl(e.target.value); setPreviewError(false); }}
                placeholder="https://example.com/cover.jpg (선택사항)"
                className="w-full bg-transparent border border-border px-3 py-2.5 text-sm font-body outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5 font-body">
                비워두면 기본 플레이스홀더가 사용됩니다
              </p>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleManualConfirm}
              disabled={!manualTitle.trim()}
              className="w-full py-3 bg-foreground text-background text-xs font-body tracking-[0.15em] uppercase hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
